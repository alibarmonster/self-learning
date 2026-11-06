/**
 * The Professional Cloud Architect's command reference. The PCA exam asks for
 * designs far more than commands, so this sheet keeps to what an architect
 * actually sets up: the resource hierarchy and its guardrails, identity, the
 * network and hybrid links, key and perimeter controls, delivery, operations,
 * cost and disaster recovery. The everyday gcloud and kubectl reference lives
 * in the ACE sheet.
 *
 * Placeholders are in capitals (ORG_ID, PROJECT_ID, REGION). Tables with
 * `mono: true` set the command column in the monospace face.
 */
import type { Cheatsheet } from '@/types';

export const commands: Cheatsheet = {
  title: 'The architect’s commands',
  filterHint: 'Filter — try “policy”, “perimeter”, “interconnect”, “key”, “replica”…',
  intro:
    'The commands behind the designs the exam asks about, grouped by the guide’s sections: the hierarchy and its guardrails, identity, networking and hybrid connectivity, data protection, delivery and operations, cost, and disaster recovery. You will rarely be asked for a flag, but knowing what each control looks like makes the scenario answers concrete. Words in capitals are placeholders.',
  parts: [
    { id: 'govern', title: 'Hierarchy, guardrails and identity', blurb: 'Folders and projects, organization policies, IAM with conditions, deny policies, just-in-time access and federation.' },
    { id: 'network', title: 'Networks and hybrid connectivity', blurb: 'Shared VPC, Private Service Connect, Network Connectivity Center, Interconnect and HA VPN, Cloud DNS and firewall policies.' },
    { id: 'protect', title: 'Protecting data', blurb: 'Keys, perimeters, sensitive data and the software supply chain.' },
    { id: 'run', title: 'Delivery, operations and cost', blurb: 'Pipelines, logging and monitoring at scale, budgets and commitments.' },
    { id: 'recover', title: 'Resilience and disaster recovery', blurb: 'Replicas, multi-region configurations, backups and failover.' }
  ],
  groups: [
    // ── govern ──────────────────────────────────────────────────────────────
    {
      id: 'hierarchy',
      part: 'govern',
      title: 'Resource hierarchy',
      note: 'Organization → folders → projects. Policies and IAM granted on a folder are inherited by everything below it, so the folder layout is a security design, not just filing.',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Find the organization', 'gcloud organizations list'],
            ['A folder per environment or business unit', 'gcloud resource-manager folders create --display-name=prod --organization=ORG_ID'],
            ['A project inside a folder', 'gcloud projects create shop-prod-1 --folder=FOLDER_ID --labels=env=prod,team=shop'],
            ['Move a project', 'gcloud projects move shop-prod-1 --folder=FOLDER_ID'],
            ['Link billing', 'gcloud billing projects link shop-prod-1 --billing-account=BILLING_ACCOUNT_ID'],
            ['Tag for conditional policies', 'gcloud resource-manager tags bindings create --tag-value=TAG_VALUE_ID --parent=//cloudresourcemanager.googleapis.com/projects/PROJECT_NUMBER']
          ]
        }
      ],
      tip: 'Landing zones are usually built with Terraform (the Cloud Foundation Fabric or the security foundations blueprint), not by hand.'
    },
    {
      id: 'org-policy',
      part: 'govern',
      title: 'Organization policies: guardrails',
      note: 'Organization policies restrict what can be configured, whoever asks. IAM decides who may act; policies decide what is allowed at all.',
      tables: [
        {
          mono: true,
          columns: ['Guardrail', 'Command or constraint'],
          rows: [
            ['See what applies to a project', 'gcloud org-policies list --project=PROJECT_ID'],
            ['Apply a policy from a file', 'gcloud org-policies set-policy policy.yaml'],
            ['Keep resources in chosen regions', 'constraints/gcp.resourceLocations'],
            ['Only identities from your domains', 'constraints/iam.allowedPolicyMemberDomains'],
            ['No service account keys', 'constraints/iam.disableServiceAccountKeyCreation'],
            ['No external IPs on VMs', 'constraints/compute.vmExternalIpAccess'],
            ['Uniform access on buckets', 'constraints/storage.uniformBucketLevelAccess'],
            ['Require CMEK for listed services', 'constraints/gcp.restrictNonCmekServices'],
            ['Test a change before enforcing it', 'gcloud org-policies set-policy policy.yaml --update-mask=dryRunSpec']
          ]
        }
      ]
    },
    {
      id: 'iam',
      part: 'govern',
      title: 'IAM: grants, conditions, deny and just-in-time access',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Grant a role to a group on a folder', 'gcloud resource-manager folders add-iam-policy-binding FOLDER_ID --member=group:sre@example.com --role=roles/compute.admin'],
            ['Time-bound grant with a condition', 'gcloud projects add-iam-policy-binding PROJECT_ID --member=user:ana@example.com --role=roles/viewer --condition=\'expression=request.time < timestamp("2026-12-31T00:00:00Z"),title=until-dec\''],
            ['Deny policy that overrides any allow', 'gcloud iam policies create no-delete --attachment-point=cloudresourcemanager.googleapis.com%2Fprojects%2FPROJECT_ID --kind=denypolicies --policy-file=deny.json'],
            ['A custom role from a trimmed list', 'gcloud iam roles create shopOperator --organization=ORG_ID --file=role.yaml'],
            ['Who can do what on a resource', 'gcloud asset analyze-iam-policy --organization=ORG_ID --full-resource-name=//storage.googleapis.com/projects/_/buckets/BUCKET'],
            ['Just-in-time elevated access (PAM)', 'gcloud pam grants create --entitlement=ENTITLEMENT --requested-duration=3600s --justification="incident 123" --location=global --project=PROJECT_ID'],
            ['Act as a service account without a key', 'gcloud config set auth/impersonate_service_account deployer@PROJECT_ID.iam.gserviceaccount.com']
          ]
        }
      ]
    },
    {
      id: 'federation',
      part: 'govern',
      title: 'Federation: no keys for people or pipelines',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['A pool for external workloads', 'gcloud iam workload-identity-pools create ci-pool --location=global'],
            ['GitHub Actions as an OIDC provider', 'gcloud iam workload-identity-pools providers create-oidc github --location=global --workload-identity-pool=ci-pool --issuer-uri=https://token.actions.githubusercontent.com --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository --attribute-condition="assertion.repository==\'acme/shop\'"'],
            ['Let that repository act as a service account', 'gcloud iam service-accounts add-iam-policy-binding deployer@PROJECT_ID.iam.gserviceaccount.com --role=roles/iam.workloadIdentityUser --member=principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/ci-pool/attribute.repository/acme/shop'],
            ['Workforce identity for staff from an external IdP', 'gcloud iam workforce-pools create staff --organization=ORG_ID --location=global']
          ]
        }
      ],
      tip: 'People from Active Directory: sync with Google Cloud Directory Sync and sign in with SAML SSO, or use Workforce Identity Federation with no sync.'
    },

    // ── network ─────────────────────────────────────────────────────────────
    {
      id: 'shared-vpc',
      part: 'network',
      title: 'Shared VPC and VPC design',
      note: 'A host project owns the network; service projects put their resources in its subnets. The network team keeps control of routes and firewalls, and app teams keep their own projects.',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['A custom-mode VPC', 'gcloud compute networks create corp-vpc --subnet-mode=custom'],
            ['A subnet with Private Google Access', 'gcloud compute networks subnets create app-jkt --network=corp-vpc --region=asia-southeast2 --range=10.10.0.0/20 --enable-private-ip-google-access'],
            ['Make a project the host', 'gcloud compute shared-vpc enable HOST_PROJECT_ID'],
            ['Attach a service project', 'gcloud compute shared-vpc associated-projects add SERVICE_PROJECT_ID --host-project=HOST_PROJECT_ID'],
            ['Let a team use one subnet only', 'gcloud compute networks subnets add-iam-policy-binding app-jkt --region=asia-southeast2 --member=group:shop-devs@example.com --role=roles/compute.networkUser'],
            ['Peer two VPCs (not transitive)', 'gcloud compute networks peerings create to-data --network=corp-vpc --peer-network=data-vpc --peer-project=DATA_PROJECT_ID']
          ]
        }
      ]
    },
    {
      id: 'psc-ncc',
      part: 'network',
      title: 'Private Service Connect and Network Connectivity Center',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Publish a service (producer)', 'gcloud compute service-attachments create orders-svc --region=asia-southeast2 --producer-forwarding-rule=orders-ilb --nat-subnets=psc-nat --connection-preference=ACCEPT_MANUAL --consumer-accept-list=CONSUMER_PROJECT=10'],
            ['Reach it from another VPC (consumer)', 'gcloud compute forwarding-rules create orders-ep --region=asia-southeast2 --network=corp-vpc --address=orders-ip --target-service-attachment=projects/PRODUCER/regions/asia-southeast2/serviceAttachments/orders-svc'],
            ['Reach Google APIs on a private IP', 'gcloud compute forwarding-rules create apis --global --network=corp-vpc --address=apis-ip --target-google-apis-bundle=all-apis'],
            ['A hub for many VPCs and sites', 'gcloud network-connectivity hubs create corp-hub'],
            ['Add a VPC as a spoke', 'gcloud network-connectivity spokes linked-vpc-network create shop-spoke --hub=corp-hub --vpc-network=projects/SHOP/global/networks/shop-vpc --global'],
            ['Add Interconnect attachments as a hybrid spoke', 'gcloud network-connectivity spokes linked-interconnect-attachments create dc-spoke --hub=corp-hub --interconnect-attachments=att-1,att-2 --region=asia-southeast2']
          ]
        }
      ],
      tip: 'Overlapping IP ranges, another organization, or exposing one service instead of a whole network → Private Service Connect. Many VPCs that must all reach each other → NCC, because peering is not transitive.'
    },
    {
      id: 'hybrid',
      part: 'network',
      title: 'Hybrid links: Interconnect, HA VPN and Cloud Router',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['A Cloud Router for BGP', 'gcloud compute routers create dc-router --network=corp-vpc --region=asia-southeast2 --asn=65010'],
            ['A Dedicated Interconnect VLAN attachment', 'gcloud compute interconnects attachments dedicated create att-1 --region=asia-southeast2 --router=dc-router --interconnect=dc-ic-1'],
            ['A Partner Interconnect attachment', 'gcloud compute interconnects attachments partner create att-p1 --region=asia-southeast2 --router=dc-router --edge-availability-domain=availability-domain-1'],
            ['An HA VPN gateway (two interfaces)', 'gcloud compute vpn-gateways create dc-vpn --network=corp-vpc --region=asia-southeast2'],
            ['Encrypt traffic on Dedicated Interconnect', 'gcloud compute interconnects macsec update dc-ic-1 --enabled'],
            ['Check the BGP sessions', 'gcloud compute routers get-status dc-router --region=asia-southeast2']
          ]
        }
      ],
      columns: ['Need', 'Choose'],
      rows: [
        ['10+ Gbps, private, at a colocation facility', 'Dedicated Interconnect (10 or 100 Gbps circuits)'],
        ['Private, smaller or not at a colocation facility', 'Partner Interconnect (50 Mbps to 50 Gbps)'],
        ['Quick, encrypted, over the internet', 'HA VPN (99.99% with two tunnels; about 3 Gbps per tunnel)'],
        ['99.99% Interconnect', 'Four connections in two metros, Cloud Routers in two regions'],
        ['A backup path for Interconnect', 'HA VPN with a lower BGP priority']
      ]
    },
    {
      id: 'dns-firewall',
      part: 'network',
      title: 'Cloud DNS and firewall policies',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['A private zone for a VPC', 'gcloud dns managed-zones create corp --dns-name=corp.example. --visibility=private --networks=corp-vpc --description="internal"'],
            ['Send on-premises names to on-premises DNS', 'gcloud dns managed-zones create onprem --dns-name=dc.example. --visibility=private --networks=corp-vpc --forwarding-targets=192.168.10.53 --description="forward"'],
            ['Let on-premises resolvers query Cloud DNS', 'gcloud dns policies create inbound --networks=corp-vpc --enable-inbound-forwarding --description="inbound"'],
            ['A hierarchical policy for the whole org', 'gcloud compute firewall-policies create --organization=ORG_ID --short-name=org-baseline'],
            ['A rule in it', 'gcloud compute firewall-policies rules create 1000 --firewall-policy=org-baseline --organization=ORG_ID --direction=INGRESS --action=deny --src-ip-ranges=0.0.0.0/0 --layer4-configs=tcp:22,tcp:3389'],
            ['Attach it to a folder', 'gcloud compute firewall-policies associations create --firewall-policy=org-baseline --organization=ORG_ID --folder=FOLDER_ID']
          ]
        }
      ]
    },

    // ── protect ─────────────────────────────────────────────────────────────
    {
      id: 'kms',
      part: 'protect',
      title: 'Cloud KMS and CMEK',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['A key ring where the data lives', 'gcloud kms keyrings create data-keys --location=asia-southeast2'],
            ['An HSM-protected key with rotation', 'gcloud kms keys create app-key --keyring=data-keys --location=asia-southeast2 --purpose=encryption --protection-level=hsm --rotation-period=90d'],
            ['An external key (Cloud EKM)', 'gcloud kms keys create ext-key --keyring=data-keys --location=asia-southeast2 --purpose=encryption --protection-level=external --default-algorithm=external-symmetric-encryption --skip-initial-version-creation'],
            ['Let a service agent use the key', 'gcloud kms keys add-iam-policy-binding app-key --keyring=data-keys --location=asia-southeast2 --member=serviceAccount:SERVICE_AGENT --role=roles/cloudkms.cryptoKeyEncrypterDecrypter'],
            ['Turn on Autokey for a folder', 'gcloud kms autokey-config update --folder=FOLDER_ID --key-project=KEY_PROJECT_ID'],
            ['Revoke access now (reversible)', 'gcloud kms keys versions disable 1 --key=app-key --keyring=data-keys --location=asia-southeast2']
          ]
        }
      ]
    },
    {
      id: 'vpcsc',
      part: 'protect',
      title: 'VPC Service Controls, IAP and sensitive data',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['An access policy for the org', 'gcloud access-context-manager policies create --organization=ORG_ID --title=corp'],
            ['A perimeter in dry-run first', 'gcloud access-context-manager perimeters dry-run create data-perim --policy=POLICY_ID --title=data --resources=projects/PROJECT_NUMBER --restricted-services=bigquery.googleapis.com,storage.googleapis.com'],
            ['Enforce it after reviewing violations', 'gcloud access-context-manager perimeters dry-run enforce data-perim --policy=POLICY_ID'],
            ['An access level for the corporate network', 'gcloud access-context-manager levels create corp-net --policy=POLICY_ID --title=corp-net --basic-level-spec=level.yaml'],
            ['Users through IAP to a web app', 'gcloud iap web add-iam-policy-binding --resource-type=backend-services --service=shop-backend --member=group:staff@example.com --role=roles/iap.httpsResourceAccessor'],
            ['SSH to private VMs through IAP', 'gcloud compute ssh app-1 --zone=asia-southeast2-a --tunnel-through-iap'],
            ['Find sensitive data across the org', 'A Sensitive Data Protection discovery scan configuration (console or the DLP API) profiles BigQuery, Cloud SQL and Cloud Storage']
          ]
        }
      ]
    },
    {
      id: 'supply-chain',
      part: 'protect',
      title: 'Software supply chain',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Scan images on push', 'gcloud services enable containerscanning.googleapis.com'],
            ['Only attested images on GKE', 'gcloud container clusters update prod --location=asia-southeast2 --binauthz-evaluation-mode=PROJECT_SINGLETON_POLICY_ENFORCE'],
            ['See the policy', 'gcloud container binauthz policy export'],
            ['Build provenance (SLSA)', 'Cloud Build writes signed provenance for images it builds; require it in the Binary Authorization policy'],
            ['Model Armor in front of an AI app', 'gcloud model-armor templates create app-guard --location=asia-southeast2 --pi-and-jailbreak-filter-settings-enforcement=enabled']
          ]
        }
      ]
    },

    // ── run ─────────────────────────────────────────────────────────────────
    {
      id: 'delivery',
      part: 'run',
      title: 'Delivery: Cloud Build and Cloud Deploy',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Register a delivery pipeline and targets', 'gcloud deploy apply --file=clouddeploy.yaml --region=asia-southeast2'],
            ['Release a build', 'gcloud deploy releases create rel-042 --delivery-pipeline=shop --region=asia-southeast2 --images=shop=asia-southeast2-docker.pkg.dev/PROJECT_ID/apps/shop@sha256:DIGEST'],
            ['Promote to the next target', 'gcloud deploy releases promote --release=rel-042 --delivery-pipeline=shop --region=asia-southeast2'],
            ['Approve a rollout to production', 'gcloud deploy rollouts approve ROLLOUT --release=rel-042 --delivery-pipeline=shop --region=asia-southeast2'],
            ['Roll back', 'gcloud deploy targets rollback prod --delivery-pipeline=shop --region=asia-southeast2'],
            ['Infrastructure as code, managed', 'gcloud infra-manager deployments apply projects/PROJECT_ID/locations/asia-southeast2/deployments/net --service-account=projects/PROJECT_ID/serviceAccounts/deployer@PROJECT_ID.iam.gserviceaccount.com --git-source-repo=https://github.com/acme/infra --git-source-directory=net']
          ]
        }
      ],
      tip: 'Canary and blue/green on GKE and Cloud Run are strategies in the Cloud Deploy pipeline file; deploy policies block rollouts in freeze windows.'
    },
    {
      id: 'observability',
      part: 'run',
      title: 'Logging and monitoring at scale',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Every project’s logs into one bucket', 'gcloud logging sinks create org-audit logging.googleapis.com/projects/LOG_PROJECT/locations/global/buckets/audit --organization=ORG_ID --include-children --log-filter=\'logName:"cloudaudit.googleapis.com"\''],
            ['Keep them for seven years, locked', 'gcloud logging buckets update audit --location=global --project=LOG_PROJECT --retention-days=2555 --locked'],
            ['Query logs with SQL', 'gcloud logging buckets update audit --location=global --project=LOG_PROJECT --enable-analytics'],
            ['Turn on Data Access audit logs', 'Edit auditConfigs in the IAM policy (gcloud projects get-iam-policy / set-iam-policy)'],
            ['One metrics view across many projects', 'Add the projects to the scoping project’s metrics scope (console or the Monitoring API)'],
            ['An SLO and burn-rate alert', 'Define the SLO on the service in Cloud Monitoring, then alert on its burn rate']
          ]
        }
      ]
    },
    {
      id: 'cost',
      part: 'run',
      title: 'Cost: budgets, exports and commitments',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['A budget with forecast alerts and Pub/Sub', 'gcloud billing budgets create --billing-account=BILLING_ACCOUNT_ID --display-name=shop --budget-amount=5000USD --threshold-rule=percent=0.9,basis=forecasted-spend --notifications-rule-pubsub-topic=projects/PROJECT_ID/topics/budget'],
            ['A resource-based commitment', 'gcloud compute commitments create web-cud --region=asia-southeast2 --plan=36-month --resources=vcpu=64,memory=256GB'],
            ['Rightsizing recommendations', 'gcloud recommender recommendations list --project=PROJECT_ID --location=asia-southeast2-a --recommender=google.compute.instance.MachineTypeRecommender'],
            ['Idle resources', 'gcloud recommender recommendations list --project=PROJECT_ID --location=asia-southeast2-a --recommender=google.compute.instance.IdleResourceRecommender'],
            ['Detailed billing in BigQuery', 'Billing export to a BigQuery dataset (console: Billing → Billing export)']
          ]
        }
      ]
    },

    // ── recover ─────────────────────────────────────────────────────────────
    {
      id: 'dr-data',
      part: 'recover',
      title: 'Replicas and multi-region data',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Dual-region bucket, 15-minute RPO', 'gcloud storage buckets create gs://shop-dr --location=ASIA1 --rpo=ASYNC_TURBO'],
            ['Cloud SQL cross-region replica', 'gcloud sql instances create shop-db-sg --master-instance-name=shop-db --region=asia-southeast1'],
            ['Planned switchover (Enterprise Plus)', 'gcloud sql instances switchover shop-db-sg'],
            ['Emergency promotion', 'gcloud sql instances promote-replica shop-db-sg'],
            ['Spanner across regions', 'gcloud spanner instances create ledger --config=nam-eur-asia1 --edition=ENTERPRISE_PLUS --processing-units=1000 --description=Ledger'],
            ['AlloyDB secondary cluster', 'gcloud alloydb clusters create-secondary shop-dr --region=asia-southeast1 --primary-cluster=projects/PROJECT_ID/locations/asia-southeast2/clusters/shop'],
            ['BigQuery replica in another region', 'ALTER SCHEMA sales ADD REPLICA `asia-southeast1` (in a bq query)']
          ]
        }
      ]
    },
    {
      id: 'dr-compute',
      part: 'recover',
      title: 'Compute, backups and failover routing',
      tables: [
        {
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Regional MIG across zones', 'gcloud compute instance-groups managed create web --region=asia-southeast2 --size=3 --template=web-tpl'],
            ['Snapshots kept in another region', 'gcloud compute resource-policies create snapshot-schedule daily --region=asia-southeast2 --daily-schedule --start-time=18:00 --storage-location=asia-southeast1 --max-retention-days=14'],
            ['An immutable backup vault', 'gcloud backup-dr backup-vaults create vault-1 --location=asia-southeast2 --backup-min-enforced-retention=30d'],
            ['DNS that fails over on health checks', 'gcloud dns record-sets create app.example.com. --zone=public --type=A --ttl=30 --routing-policy-type=FAILOVER --routing-policy-primary-data=PRIMARY_FORWARDING_RULE --routing-policy-backup-data-type=GEO --routing-policy-backup-data="asia-southeast1=203.0.113.10" --enable-health-checking']
          ]
        }
      ],
      tip: 'Whatever the tool, a DR design only counts once a test has measured the RTO and RPO.'
    }
  ]
};

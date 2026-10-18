# kubectl, bq, terraform and docker: exact syntax and terminal output/error shapes for an ACE command-quiz grader and error simulator

Provenance labels used below:
- **[LOCAL-K]**: captured verbatim in this session by running the real client, `kubectl` **v1.34.1** (Kustomize v5.7.1) from Docker Desktop on Windows, with no cluster reachable (2026-10-17). Server-dependent commands could not be exercised. Windows network errors differ from Linux/Cloud Shell, as noted where it matters.
- **[LOCAL-D]**: captured verbatim by running Docker CLI **29.2.1** (API 1.53) and Docker Compose **v5.0.2** on Windows, with the daemon *not* running, so only client-side parse errors were exercised.
- **RECONSTRUCTED**: written from general knowledge of the tool and *not* verified against a source this session. A simulator can use it, but it should not be treated as verbatim.
- Exit codes are given only where they were captured directly. Some local runs piped output through `head`, which masks the exit code; those are omitted.

---

## Q1. kubectl: exact syntax, flags, aliases, equivalent forms and common mistakes

### Takeaway
kubectl takes the form `kubectl [command] [TYPE] [NAME] [flags]`. Resource TYPE is case-insensitive and can be singular, plural or a short name (`po`, `svc`, `deploy`, `ns`, `no`, `cm`, `hpa`), and `TYPE NAME` is interchangeable with `TYPE/NAME`. A grader should therefore normalise TYPE aliases, the `TYPE/NAME` form and `--flag=value` vs `--flag value` before comparing. One 2026-specific change: in kubectl 1.34 `kubectl autoscale` uses `--cpu`/`--memory`, and `--cpu-percent` still works but prints a deprecation warning.

### Cited Findings

**General grammar and equivalent forms**
- Syntax: `kubectl [command] [TYPE] [NAME] [flags]`. The docs say "Resource types are case-insensitive and you can specify the singular, plural, or abbreviated forms", with the example `kubectl get pod pod1` = `kubectl get pods pod1` = `kubectl get po pod1`. "Names are case-sensitive." — [kubectl reference](https://kubernetes.io/docs/reference/kubectl/)
- Two ways to address several resources: `TYPE1 name1 name2` (e.g. `kubectl get pod example-pod1 example-pod2`) and `TYPE1/name1 TYPE2/name3` (e.g. `kubectl get pod/example-pod1 replicationcontroller/example-rc1`). — [kubectl reference](https://kubernetes.io/docs/reference/kubectl/)
- Fully-qualified forms are also accepted. Both `kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1` and `kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1` print `deployment.apps/nginx-deployment image updated`. — [Deployments concept page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- Short names from the Resource types table: `pods`→`po`, `services`→`svc`, `deployments`→`deploy`, `namespaces`→`ns`, `nodes`→`no`, `configmaps`→`cm`, `horizontalpodautoscalers`→`hpa`, `replicasets`→`rs`, `daemonsets`→`ds`, `statefulsets`→`sts`, `persistentvolumeclaims`→`pvc`, `persistentvolumes`→`pv`, `events`→`ev`, `ingresses`→`ing`, `cronjobs`→`cj`, `serviceaccounts`→`sa`, `endpoints`→`ep`. **`secrets` and `jobs` have no short name.** Namespaced=false for `namespaces`, `nodes` and `persistentvolumes`. — [kubectl reference, Resource types](https://kubernetes.io/docs/reference/kubectl/)
- Output formats for `-o/--output` on `get`: `json, yaml, name, go-template, go-template-file, template, templatefile, jsonpath, jsonpath-as-json, jsonpath-file, custom-columns, custom-columns-file, wide` — [LOCAL-K] (`kubectl get -h`). The docs also list `-o kyaml` ("KYAML is a Kubernetes-specific dialect of YAML"). — [kubectl reference](https://kubernetes.io/docs/reference/kubectl/)
- `-o wide`: "Output in the plain-text format with any additional information. For pods, the node name is included." — [kubectl reference](https://kubernetes.io/docs/reference/kubectl/)

**Global flags (accepted on every command)**
- `-n, --namespace=''`, `--context=''`, `--kubeconfig=''`, `-s, --server=''`, `--cluster=''`, `--user=''`, `-v, --v=0` — [LOCAL-K] (`kubectl options`)
- `get` flags: `-A, --all-namespaces=false` ("Namespace in current context is ignored even if specified with --namespace"), `-l, --selector=''` (supports `=`, `==`, `!=`, `in`, `notin`), `--field-selector=''`, `--show-labels=false`, `--sort-by=''` (a JSONPath, e.g. `'{.metadata.name}'`), `-w, --watch=false`, `-f, --filename=[]` — [LOCAL-K] (`kubectl get -h`)

**config / context**
- `kubectl config view`, `kubectl config get-contexts`, `kubectl config current-context`, `kubectl config use-context my-cluster-name`, `kubectl config set-context --current --namespace=ggckad-s2` ("permanently save the namespace for all subsequent kubectl commands in that context") — [kubectl quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- Usage: `kubectl config set-context [NAME | --current] [--cluster=cluster_nickname] [--user=user_nickname] [--namespace=namespace]` and `kubectl config use-context CONTEXT_NAME` — [LOCAL-K]
- Outputs captured with a throwaway kubeconfig — [LOCAL-K]:
  - `kubectl config use-context X` → `Switched to context "X".`
  - `kubectl config set-context --current --namespace=staging` → `Context "gke_my-project_us-central1_cluster-1" modified.`
  - `kubectl config set-context dev --cluster=... --user=... --namespace=dev` → `Context "dev" created.`
  - `kubectl config set-cluster ...` → `Cluster "NAME" set.`; `kubectl config set-credentials ...` → `User "NAME" set.`
  - `kubectl config current-context` prints the bare context name on one line.
  - `kubectl config get-contexts -o name` prints one context name per line.
  - `kubectl config view` prints YAML (`apiVersion: v1`, `clusters:`, `contexts:`, `current-context:`, `kind: Config`, `users:`) with secrets shown as `REDACTED` (e.g. `token: REDACTED`).
  - `kubectl config set-context --current` with no other flags still prints `Context "..." modified.` and does not error.

**Pods: logs, exec, port-forward, top**
- `kubectl logs [-f] [-p] (POD | TYPE/NAME) [-c CONTAINER] [options]`. Flags: `-f, --follow`, `-p, --previous`, `-c, --container`, `-l, --selector`, `--all-containers`, `--since=0s`, `--tail=-1` — [LOCAL-K]
- Doc examples: `kubectl logs my-pod --previous`, `kubectl logs my-pod -c my-container`, `kubectl logs -f my-pod`, `kubectl logs -f -l name=myLabel --all-containers` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- `kubectl exec (POD | TYPE/NAME) [-c CONTAINER] [flags] -- COMMAND [args...]`. Flags: `-i, --stdin`, `-t, --tty`, `-c, --container`, `-f, --filename`. So `-it` means `-i -t` — [LOCAL-K]. Doc form: `kubectl exec --stdin --tty my-pod -- /bin/sh`; multi-container form: `kubectl exec my-pod -c my-container -- ls /` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- `kubectl port-forward TYPE/NAME [options] [LOCAL_PORT:]REMOTE_PORT [...]`, with `--address=[localhost]` — [LOCAL-K]. Examples: `kubectl port-forward my-pod 5000:6000`, `kubectl port-forward svc/my-service 5000`, `kubectl port-forward deploy/my-deployment 5000:6000` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- `kubectl top pod [NAME | -l label]` (flags `--containers`, `--sort-by`, `-l`) and `kubectl top node [NAME | -l label]` — [LOCAL-K]. Examples: `kubectl top pod POD_NAME --sort-by=cpu` ("'cpu' or 'memory'"), `kubectl top node my-node` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/). The `kubectl top` help text says "The Metrics Server must be installed and running in the cluster for this command to work." — [LOCAL-K]
- Events: `kubectl get events --sort-by=.metadata.creationTimestamp` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- `kubectl get pods -o wide` and `kubectl get services --sort-by=.metadata.name` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- `kubectl cluster-info` ("Display addresses of the master and services") and `kubectl cluster-info dump` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**apply / delete / create / expose**
- `kubectl apply (-f FILENAME | -k DIRECTORY)`. Flags include `-f, --filename`, `-k, --kustomize`, `-R, --recursive`, `--dry-run='none'`, `--prune`, `--server-side`, `-l` — [LOCAL-K]. Examples: `kubectl apply -f ./my-manifest.yaml`, `kubectl apply -f ./dir` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- `kubectl delete ([-f FILENAME] | [-k DIRECTORY] | TYPE [(NAME | -l label | --all)])`. Flags include `--all`, `--force`, `--grace-period=-1`, `--now`, `--cascade='background'`, `--wait=true` — [LOCAL-K]. Example: `kubectl delete -f ./pod.json` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- `kubectl create deployment NAME --image=image -- [COMMAND] [args...]`. Flags: `--image=[]` (required), `-r, --replicas=1`, `--port=-1`, `--dry-run`, `-o` — [LOCAL-K]. Note that `-r` is a real short alias for `--replicas` on `create deployment`.
- `kubectl create deployment web --image=nginx --dry-run=client` → `deployment.apps/web created (dry run)` — [LOCAL-K]. With `-o yaml` it emits an `apps/v1` Deployment whose labels and selector are `app: web` and whose container `name: nginx` is derived from the image — [LOCAL-K]
- `kubectl expose (-f FILENAME | TYPE NAME) [--port=port] [--protocol=TCP|UDP|SCTP] [--target-port=number-or-name] [--name=name] [--external-ip=...] [--type=type]`. `--type`: "ClusterIP, NodePort, LoadBalancer, or ExternalName. Default is 'ClusterIP'." `--port`: "Copied from the resource being exposed, if unspecified". `--protocol` defaults to TCP — [LOCAL-K]
- Doc example: `kubectl expose deployment hello-world --type=LoadBalancer --name=my-service` — [expose-external-ip tutorial](https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/)

**scale / autoscale / set image / rollout**
- `kubectl scale [--resource-version=version] [--current-replicas=count] --replicas=COUNT (-f FILENAME | TYPE NAME)` — [LOCAL-K]. Examples: `kubectl scale --replicas=3 rs/foo`, `kubectl scale --current-replicas=2 --replicas=3 deployment/mysql` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/). Output: `deployment.apps/nginx-deployment scaled` — [Deployments page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- **autoscale (changed in 1.34):** `kubectl autoscale (-f FILENAME | TYPE NAME | TYPE/NAME) [--min=MINPODS] --max=MAXPODS [--cpu=CPU] [--memory=MEMORY]`. `--max` is "Required". `--cpu` accepts `70%` (utilization) or `500m` (quantity). Examples: `kubectl autoscale rc foo --max=5 --cpu=80%` and `kubectl autoscale deployment bar --min=3 --max=6 --cpu=60% --memory=70%` — [LOCAL-K]
- Using the old flag prints, verbatim: `Flag --cpu-percent has been deprecated, Use --cpu with percentage or resource quantity format (e.g., '70%' for utilization or '500m' for milliCPU).` The command then continues, so the flag is still accepted. — [LOCAL-K]
- `kubectl set image (-f FILENAME | TYPE NAME) CONTAINER_NAME_1=CONTAINER_IMAGE_1 ...` — [LOCAL-K]. Example: `kubectl set image deployment/frontend www=image:v2` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- Rollout subcommands: `history, pause, restart, resume, status, undo`, valid for deployments, daemonsets and statefulsets — [LOCAL-K]. Forms: `kubectl rollout status (TYPE NAME | TYPE/NAME)` (`-w, --watch=true`, `--timeout`, `--revision`); `kubectl rollout history ... [--revision=N]`; `kubectl rollout undo ... [--to-revision=N]` — [LOCAL-K]
- Examples: `kubectl rollout undo deployment/frontend --to-revision=2`, `kubectl rollout status -w deployment/frontend`, `kubectl rollout restart deployment/frontend` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**secrets / configmaps**
- `kubectl create secret generic NAME [--type=string] [--from-file=[key=]source] [--from-literal=key1=value1] [--dry-run=server|client|none]`, plus `--from-env-file` — [LOCAL-K]
- `kubectl create configmap NAME [--from-file=[key=]source] [--from-literal=key1=value1] [--dry-run=...]`, plus `--from-env-file` — [LOCAL-K]
- `--from-literal` may repeat. Output: `secret/db-creds created (dry run)`. The YAML shows base64 `data:` (e.g. `password: czNjcjN0`) for a Secret and plain `data:` (`ENV: prod`) for a ConfigMap — [LOCAL-K]
- `kubectl create secret generic s1` with no `--from-*` flag still succeeds, creating an empty secret — [LOCAL-K]

**Node maintenance**
- `kubectl drain NODE`. Flags: `--ignore-daemonsets=false` ("Ignore DaemonSet-managed pods."), `--delete-emptydir-data=false` ("Continue even if there are pods using emptyDir"), `--force=false` ("Continue even if there are pods that do not declare a controller."), `--grace-period=-1`, `--timeout=0s`, `--disable-eviction`, `--pod-selector`, `-l` — [LOCAL-K]
- Help text: "If there are daemon set-managed pods, drain will not proceed without --ignore-daemonsets" — [LOCAL-K]
- Examples: `kubectl cordon my-node`, `kubectl drain my-node`, `kubectl uncordon my-node` — [quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

### Inferences
- Grader normalisation for kubectl:
  1. Map TYPE aliases to one canonical form: `po|pod|pods`, `svc|service|services`, `deploy|deployment|deployments|deployment.apps|deployment.v1.apps`, `no|node|nodes`, `ns|namespace|namespaces`, `cm|configmap|configmaps`, `hpa|horizontalpodautoscaler(s)`.
  2. Treat `TYPE NAME` and `TYPE/NAME` as the same.
  3. Treat `-n X`, `-nX`, `--namespace X` and `--namespace=X` as the same, and allow them anywhere after `kubectl`.
  4. Expand bundled short booleans (`-it` = `-i -t`).
  5. Treat flag order as irrelevant.
  6. For `exec`, require the `--` separator (see Q2 for the error).
- Accept both `--cpu-percent=80` (what most ACE study material still shows) and `--cpu=80%`. If the simulator targets kubectl ≥1.34, also print the deprecation line for `--cpu-percent`.
- Note that the Deployments concept page's own autoscale example uses `--cpu-percent=80%` (with a percent sign) — [Deployments page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/). Accept it.
- Common mistakes worth targeted feedback:
  - `kubectl get pod` vs `kubectl get pods` (both are valid, so do not mark wrong).
  - `kubectl logs deployment web` (should be `deployment/web` or a pod name).
  - `kubectl exec -it pod sh` without `--`.
  - `kubectl expose deployment web --type=loadbalancer` (the type value is case-sensitive; RECONSTRUCTED claim, not verified).
  - `--replicas 3` vs `--replicas=3` (both are valid).
  - `kubectl drain node` without `--ignore-daemonsets` on GKE, where DaemonSets always exist, so it will fail.
  - Using `kubectl scale` for autoscaling.
  - `kubectl set image deployment/web nginx:1.25`, missing the `CONTAINER=` part.
- GKE context names usually look like `gke_PROJECT_LOCATION_CLUSTER`, which is what `gcloud container clusters get-credentials` writes (RECONSTRUCTED, from general knowledge).

### Gaps
- Success lines for `expose`, `autoscale`, `cordon`, `drain` and `uncordon` could not be captured without a cluster. Likely forms (RECONSTRUCTED): `service/web exposed`, `horizontalpodautoscaler.autoscaling/web autoscaled`, `node/NODE cordoned`, `node/NODE already cordoned`, `evicting pod NS/POD`, `pod/POD evicted`, `node/NODE drained`, `node/NODE uncordoned`.
- The Deployments page documents the autoscale output as `deployment.apps/nginx-deployment scaled` — [Deployments page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/). This conflicts with the reconstructed HPA `autoscaled` line above, and the doc line looks like a copy-paste of the scale output. Not resolved.
- `kubectl cluster-info` output was not captured. Likely form (RECONSTRUCTED): `Kubernetes control plane is running at https://34.x.x.x` and `GLBCDefaultBackend is running at ...` / `KubeDNS is running at ...`, followed by `To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.`

---

## Q2. kubectl: exact error strings

### Takeaway
Most of the requested strings were reproduced verbatim on kubectl v1.34.1. Two different footers are in use. Flag-parse errors end with `See 'kubectl <cmd> --help' for usage.`. Argument and validation errors end with `See 'kubectl <cmd> -h' for help and examples`. Unknown top-level commands produce a tab-indented "Did you mean this?" list. One new message: `kubectl exec POD sh` without `--` is now a hard error.

### Cited Findings
- Unknown command, verbatim — [LOCAL-K]:
  ```
  error: unknown command "gt" for "kubectl"

  Did you mean this?
  	set
  	get
  	cp
  ```
  `kubectl foo` gives the same shape, with the single suggestion `top`. Exit code 1. The second footer line the brief expected, `Run 'kubectl --help' for usage.`, did **not** appear in v1.34.1 output.
- Unknown long flag — [LOCAL-K], exit 1:
  ```
  error: unknown flag: --foo
  See 'kubectl get --help' for usage.
  ```
- Unknown short flag — [LOCAL-K], exit 1:
  ```
  error: unknown shorthand flag: 'z' in -z
  See 'kubectl get --help' for usage.
  ```
- Missing required flags — [LOCAL-K], exit 1:
  - `kubectl create deployment web` → `error: required flag(s) "image" not set`
  - `kubectl scale deployment web` → `error: required flag(s) "replicas" not set`
  - `kubectl autoscale deployment web --min=1` → `error: required flag(s) "max" not set`
- Missing NAME — [LOCAL-K], exit 1:
  ```
  error: exactly one NAME is required, got 0
  See 'kubectl create deployment -h' for help and examples
  ```
  The same message appears for `create secret generic` and `create configmap`, with the subcommand substituted in the footer.
- `kubectl delete` and `kubectl expose` with no args — [LOCAL-K], exit 1:
  ```
  error: You must provide one or more resources by argument or filename.
  Example resource specifications include:
     '-f rsrc.yaml'
     '--filename=rsrc.json'
     '<resource> <name>'
     '<resource>'
  ```
- `kubectl get` with no args — [LOCAL-K]:
  ```
  You must specify the type of resource to get. Use "kubectl api-resources" for a complete list of supported resources.

  error: Required resource not specified.
  Use "kubectl explain <resource>" for a detailed description of that resource (e.g. kubectl explain pods).
  See 'kubectl get -h' for help and examples
  ```
- `kubectl describe` with no args → `error: You must specify the type of resource to describe. Use "kubectl api-resources" for a complete list of supported resources.` — [LOCAL-K]
- `kubectl apply` with no `-f` → `error: must specify one of -f and -k` — [LOCAL-K]
- `kubectl logs` with no pod — [LOCAL-K]:
  ```
  error: expected 'logs [-f] [-p] (POD | TYPE/NAME) [-c CONTAINER]'.
  POD or TYPE/NAME is a required argument for the logs command
  See 'kubectl logs -h' for help and examples
  ```
- `kubectl exec mypod` with no command → `error: you must specify at least one command for the container` — [LOCAL-K]
- `kubectl exec -it mypod sh` (no `--`) — [LOCAL-K]:
  ```
  error: exec [POD] [COMMAND] is not supported anymore. Use exec [POD] -- [COMMAND] instead
  See 'kubectl exec -h' for help and examples
  ```
- `kubectl drain` with no node → `error: USAGE: drain NODE [flags]` followed by `See 'kubectl drain -h' for help and examples`. `cordon` gives the same with its own name — [LOCAL-K]
- `kubectl port-forward` with no args → `error: TYPE/NAME and list of ports are required for port-forward` followed by `See 'kubectl port-forward -h' for help and examples` — [LOCAL-K]
- Unknown rollout subcommand (`kubectl rollout undx deployment/web`) — [LOCAL-K]. This shape differs from the top-level one, with no "Did you mean":
  ```
  error: unknown command "undx deployment/web"
  See 'kubectl rollout -h' for help and examples
  ```
- `kubectl create foo` → `error: Unexpected args: [foo]` followed by `See 'kubectl create -h' for help and examples` — [LOCAL-K]
- `kubectl create configmap c1 --from-literal=FOO` → `error: invalid literal source FOO, expected key=value` — [LOCAL-K]
- `kubectl create configmap x --from-file=missing.properties` → `error: error reading nonexistent.properties: ` followed by an OS-specific message (on Windows, "The system cannot find the file specified."). Linux most likely ends in `no such file or directory` (RECONSTRUCTED). — [LOCAL-K]
- Kubeconfig problems — [LOCAL-K], exit 1:
  - `kubectl config current-context` with an empty kubeconfig → `error: current-context is not set`
  - `kubectl config use-context foo` → `error: no context exists with the name: "foo"`
  - `kubectl config get-contexts` with no contexts → just the header `CURRENT   NAME   CLUSTER   AUTHINFO   NAMESPACE`, exit 0
- No cluster configured, Windows capture — [LOCAL-K]. kubectl prints five klog lines and then a final summary line:
  ```
  E1017 19:29:12.530818   25652 memcache.go:265] "Unhandled Error" err="couldn't get current server API group list: Get \"http://localhost:8080/api?timeout=32s\": dial tcp [::1]:8080: connectex: No connection could be made because the target machine actively refused it."
  ...
  Unable to connect to the server: dial tcp [::1]:8080: connectex: No connection could be made because the target machine actively refused it.
  ```
- The Linux/Cloud Shell wording is `The connection to the server localhost:8080 was refused - did you specify the right host or port?`. It is widely reported and is the title of many threads; the usual cause is a missing kubeconfig (for example, before `gcloud container clusters get-credentials`). — [Kubernetes Discuss thread](https://discuss.kubernetes.io/t/the-connection-to-the-server-localhost-8080-was-refused-did-you-specify-the-right-host-or-port/1464); [Kubernetes Discuss #13214](https://discuss.kubernetes.io/t/connection-to-the-server-localhost-8080-was-refused/13214)
- `error: the server doesn't have a resource type "..."` appears when a name is given where a TYPE is expected (e.g. `kubectl delete ds-one-lm7sr ...`). `Error from server (NotFound): pods "rs-one-3c6pb" not found` appears for a nonexistent pod name. — [Linux Foundation forum](https://forum.linuxfoundation.org/discussion/858066/chapter-4-lab-4-2-exercise-5); [Baeldung](https://www.baeldung.com/ops/kubectl-error-server-resource-type-node)
- Drain refusal fragments: `daemonSetFatal` = "DaemonSet-managed Pods (use --ignore-daemonsets to ignore)", `localStorageFatal` = "Pods with local storage (use --delete-emptydir-data to override)", `unmanagedFatal` = "Pods that declare no controller (use --force to override)". These are wrapped by the format `"cannot delete %s: %s"`, where the second `%s` is the pod list. Warnings: "ignoring DaemonSet-managed Pods", "deleting Pods with local storage", "deleting Pods that declare no controller". — [kubectl pkg/drain/filters.go](https://github.com/kubernetes/kubectl/blob/master/pkg/drain/filters.go)

### Inferences
- A realistic drain error for GKE (RECONSTRUCTED assembly from the constants above): `error: unable to drain node "gke-...-abcd" due to error: cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): kube-system/fluentbit-gke-xxxxx, kube-system/gke-metrics-agent-xxxxx, ..., continuing command...` followed by `There are pending nodes to be drained:`. The prefix and suffix are not verified.
- "Did you mean" suggestions come from cobra's edit-distance matching (distance ≤2 plus prefix matches). A simulator can emulate them with a Levenshtein ≤2 check over the top-level command list (`get, set, cp, top, run, logs, exec, apply, create, delete, describe, expose, scale, autoscale, rollout, label, annotate, drain, cordon, uncordon, config, ...`), each printed on its own line with a leading tab.
- Footer rule: unknown-flag errors use `See 'kubectl <path> --help' for usage.`; argument and usage errors use `See 'kubectl <path> -h' for help and examples`.

### Gaps
- `Error from server (AlreadyExists): deployments.apps "web" already exists` and `Error from server (NotFound): deployments.apps "web" not found` are the standard shapes but were not captured (RECONSTRUCTED). Note that the resource prints as `deployments.apps`, while core resources print as `pods` or `services`.
- `error: Metrics API not available` (kubectl top without metrics-server) was not verified.
- The klog `E...memcache.go` line numbers vary by version. 1.34.1 shows `memcache.go:265] "Unhandled Error"`.

---

## Q3. bq (BigQuery CLI): syntax, flag placement, outputs and error formats

### Takeaway
bq takes the form `bq COMMAND [FLAGS] [ARGUMENTS]`, and Google says to "Place any global flags before the `bq` command, and then include command-specific flags". So `bq --location=US mk --dataset PROJECT:DATASET` is the documented canonical shape. bq is built on Python absl flags, so an unknown flag produces `FATAL Flags parsing error: ...` followed by `Pass --helpshort or --helpfull to see help on flags.`. Operation failures use `BigQuery error in <op> operation: <message>`. The dry-run sentence and the rm confirmation prompt are verified verbatim.

### Cited Findings

**Syntax and global flags**
- Format `bq COMMAND [FLAGS] [ARGUMENTS]`; "Place any global flags before the `bq` command, and then include command-specific flags." Example: `bq --location=us mk --reservation --project_id=project reservation_name` — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- Global flags:
  - `--location=LOCATION`: required for `bq cancel` and for `bq show` with `--jobs`.
  - `--project_id=PROJECT`
  - `--dataset_id=DATASET_ID`: `PROJECT:DATASET` or `DATASET`.
  - `--format=`: `pretty | sparse | prettyjson | json | csv`, or `none`.
  - `--quiet` / `-q`
  - `--headless`
  - `--synchronous_mode` / `-sync`: default true.

  — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)

**mk**
- `-d`/`--dataset`, `-t`/`--table`, `--transfer_config`. `--data_source` is required for a transfer config, with values like `amazon_s3`, `google_cloud_storage` and `scheduled_query`. `--params`/`-p` takes transfer params as JSON. `--time_partitioning_type` allows `DAY`, `HOUR`, `MONTH`, `YEAR`. Examples: `--range_partitioning=customer_id,0,10000,100` and `--schema=Region:STRING,Quarter:STRING,Total_sales:INTEGER` — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- `bq mk --dataset babynames` → `Dataset 'babynames' successfully created.` — [bq quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq)
- Table with inline schema, where the schema is a trailing positional after the table:
  ```
  bq mk -t --expiration 3600 --description "This is my table" --label organization:development mydataset.mytable qtr:STRING,sales:FLOAT,year:STRING
  ```
  The same with a schema file: `... --table ... mydataset.mytable /tmp/myschema.json` — [Create and use tables](https://docs.cloud.google.com/bigquery/docs/tables)
- Partitioned table, with schema as a flag:
  ```
  bq mk -t --schema 'ts:TIMESTAMP,qtr:STRING,sales:FLOAT' --time_partitioning_field ts --time_partitioning_type HOUR --time_partitioning_expiration 259200 mydataset.mytable
  ```
  Ingestion-time variant: `bq mk -t --schema qtr:STRING,sales:FLOAT,year:STRING --time_partitioning_type DAY --time_partitioning_expiration 259200 mydataset.mytable`. Integer range: `--range_partitioning=customer_id,0,100,10`. There is also `--require_partition_filter=BOOLEAN`. — [Create partitioned tables](https://docs.cloud.google.com/bigquery/docs/creating-partitioned-tables)
- Success format strings: `"Dataset '%s' successfully created."`, `"Table '%s' successfully created."`, `"Dataset '%s' already exists."`, `"Table '%s' already exists."` — [bq.py (third-party mirror of an older bq release)](https://github.com/yoheimuta/google-bigquery-tools/blob/master/bq/bq.py)

**load**
- `bq load [FLAGS] DESTINATION_TABLE SOURCE_DATA [SCHEMA]`. Example: `bq load myDataset.newTable gs://mybucket/info.csv ./info_schema.json`
- `--source_format`: `CSV | NEWLINE_DELIMITED_JSON | AVRO | DATASTORE_BACKUP | PARQUET | ORC`
- Other flags: `--autodetect`, `--skip_leading_rows=N`, `--replace`, `--field_delimiter`/`-F`, `--time_partitioning_field`, `--time_partitioning_type` (default `DAY`)

  — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- Example with inline schema: `bq load babynames.names2024 yob2024.txt name:string,assigned_sex_at_birth:string,count:integer`. Output:
  ```
  Upload complete.
  Waiting on bqjob_r3c045d7cbe5ca6d2_0000018292f0815f_1 ... (1s) Current status: DONE
  ```
  — [bq quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq)

**query**
- Flags:
  - `--use_legacy_sql={true|false}`: set it to `false` for GoogleSQL. The default comes from config, or `true` if none is set.
  - `--dry_run`: "the query is validated but not run".
  - `--destination_table=PROJECT:DATASET.TABLE`
  - `--max_rows`/`-n`: default 100.
  - `--replace`, `--append_table`
  - `--parameter=NAME:TYPE:VALUE`: e.g. `--parameter=Count:INTEGER:42`.
  - `--batch`, `--maximum_bytes_billed`
- Example: `bq query --use_legacy_sql=false < query.sql`

  — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- Dry run: `bq query --use_legacy_sql=false --dry_run 'SELECT COUNTRY, AIRPORT, IATA FROM \`project_id\`.dataset.airports LIMIT 1000'` → `Query successfully validated. Assuming the tables are not modified, running this query will process 10918 bytes of data.` — [Estimate and control costs](https://docs.cloud.google.com/bigquery/docs/estimate-costs). The source format string is a single line: `"Query successfully validated. Assuming the tables are not modified, running this query will process %s bytes of data."` — [bq.py mirror](https://github.com/yoheimuta/google-bigquery-tools/blob/master/bq/bq.py)
- Bytes-billed cap error: `Error: Query exceeded limit for bytes billed: 1000000. 10485760 or higher required.` — [Estimate and control costs](https://docs.cloud.google.com/bigquery/docs/estimate-costs)

**ls / show / head / extract / cp / rm**
- `bq ls [FLAGS] [RESOURCE]` (e.g. `bq ls myDataset`), `--all`/`-a` — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference). `bq ls --datasets=true` shows a `datasetId` column. `bq ls --format=pretty babynames` shows a bordered table with `names2024` of type `TABLE` — [bq quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq)
- `bq show` flags: `-j`/`--job`, `--schema`, `-d`/`--dataset`, `--transfer_config`, `--encryption_service_account` — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference). `bq show --format=prettyjson dataset.table` returns the schema as JSON — [Create and use tables](https://docs.cloud.google.com/bigquery/docs/tables)
- `bq head [FLAGS] [TABLE]`. Flags: `--max_rows`/`-n` (default 100), `--start_row`/`-s`, `--selected_fields`/`-c`, `--job`/`-j`, `--table`/`-t`. Example: `bq head --max_rows=10 --start_row=50 --selected_fields=field1,field3 myDataset.myTable` — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- `bq extract [FLAGS] RESOURCE DESTINATION`
  - `--destination_format`: `CSV | NEWLINE_DELIMITED_JSON | AVRO | PARQUET` (default CSV)
  - `--compression`: `GZIP | DEFLATE | SNAPPY | NONE`
  - `--field_delimiter`, `--print_header`
  - Example: `bq extract --destination_format=CSV --field_delimiter='|' myDataset.myTable gs://myBucket/myFile.csv`

  — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- `bq cp [FLAGS] SOURCE_TABLE DESTINATION_TABLE` (e.g. `bq cp myDataset.myTable myDataset.myTableCopy`). Flags: `-a`/`--append_table`, `-f`/`--force`, `-n`/`--no_clobber`, `--destination_kms_key` — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- `bq rm` flags: `-d`/`--dataset`, `-f`/`--force` (no prompt), `-r`/`--recursive` (dataset plus its tables), `-t`/`--table`, `-j`/`--job`, `--transfer_config`, `-m`/`--model` — [bq CLI reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)
- `bq rm --recursive=true babynames` prompts `rm: remove dataset 'myproject:babynames'? (y/N)` — [bq quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq). The older source format was `'rm: remove %r? (y/N) '` — [bq.py mirror](https://github.com/yoheimuta/google-bigquery-tools/blob/master/bq/bq.py)

**Error formats**
- `'BigQuery error in %s operation: %s'`, `'Error in query string: %s'`, `'Unexpected exception in %s operation: %s'` — [bq.py mirror](https://github.com/yoheimuta/google-bigquery-tools/blob/master/bq/bq.py)
- The current CLI also shows "Unexpected exception in mk operation: You have encountered a bug in the BigQuery CLI." — [teratail](https://teratail.com/questions/252244)
- absl flag errors go to stderr as `FATAL Flags parsing error: {message}` (if the message is multi-line, `FATAL Flags parsing error:` followed by the indented message), then `Pass --helpshort or --helpfull to see help on flags.`, with exit code 1 — [absl-py app.py](https://github.com/abseil/abseil-py/blob/main/absl/app.py)
- Duplicate (HTTP 409) errors occur "when trying to create a job, dataset, or table that already exists" — [BigQuery error messages](https://docs.cloud.google.com/bigquery/docs/error-messages)
- A load into a missing dataset or wrong location was reported as `BigQuery error in load operation: Error processing job ... Not found: Dataset qwiklabs-gcp-...:source_data was not found in location US`. Treat this as user-reported, surfaced via search; the exact page was not confirmed. — [Exploratory community](https://community.exploratory.io/t/google-bigquery-dataset-was-not-found-in-location-error-is-raised/2187)

### Inferences
- Realistic simulated errors, assembled from the verified format strings (the exact server wording is RECONSTRUCTED):
  - `BigQuery error in mk operation: Dataset 'my-project:sales' already exists.`
  - `BigQuery error in query operation: Error processing job 'my-project:bqjob_r1a2b3c4_0000019a_1': Unrecognized name: foo at [1:8]`
  - `Error in query string: Error processing job '...': Syntax error: Unexpected identifier "FORM" at [1:10]`
  - `BigQuery error in show operation: Not found: Table my-project:sales.ordrs`
- The "Unrecognized name: X at [1:79]" fragment is a real BigQuery message — [cube.js issue #8206](https://github.com/cube-js/cube/issues/8206).
- Boolean flags in absl also accept `--flag`, `--noflag` and `--flag=true|false`. So `--nouse_legacy_sql` and `--use_legacy_sql=false` are equivalent, as are `--dry_run` and `--dry_run=true`, and the grader should accept all of them. This is standard absl behaviour, not checked against a source this session.
- For `bq mk`, accept both `PROJECT:DATASET` and `DATASET` (the latter uses the default project). Accept `-d`/`--dataset`/`--dataset=true` and `-t`/`--table`. The schema can be a trailing positional (inline `name:TYPE,...` or a `.json` path) or `--schema`.
- For placement, the canonical grading rule is that global flags (`--location`, `--project_id`, `--format`, `-q`) come *before* the command. Common mistakes:
  - `bq mk --location=US -d ds` (flag after the command; see Gaps on whether it actually works)
  - legacy SQL left on (no `--use_legacy_sql=false`)
  - using `.` instead of `:` between project and dataset in `PROJECT:DATASET` (the GoogleSQL text form is `project.dataset.table`, but bq CLI references use `project:dataset.table`)
  - `bq rm -r ds` without `-d`, which works because dataset is inferred, but beginners often forget `-f` and are prompted
  - `bq load` without `--source_format` on JSON files (CSV is the default)
  - forgetting `--autodetect` or a schema

### Gaps
- Whether current bq tolerates global flags after the command (e.g. `bq mk --location=US ...`) was not verified. The docs only say to put them first.
- The exact text for an unknown bq *command* (e.g. `bq mkk`) was not found in any source. The old `do_help` prints nothing for an unknown name in `bq help`.
- Unverified examples of an absl flag error: `FATAL Flags parsing error: Unknown command line flag 'foo'` / `Unknown command line flag 'foo'. Did you mean: ... ?` (RECONSTRUCTED).
- The exact `bq ls` column header for tables is from third-party/lab examples only: `tableId   Type    Labels   Time Partitioning   Clustered Fields`, with rows like `customers   TABLE`. The column set varies by version. The dataset listing header is `datasetId` (verified, [quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq)).
- The `bq query` pretty result table (`+------+-------+` borders) is RECONSTRUCTED.
- A verbatim `bq mk --transfer_config` example was not retrieved. The fields `--target_dataset`, `--display_name`, `--data_source=scheduled_query` and `--params='{"query":...}'` are known, but the full example is RECONSTRUCTED.

---

## Q4. terraform: commands, flags and exact output text

### Takeaway
The key Terraform strings were taken verbatim from the current `hashicorp/terraform` main-branch source. These include the init success banner, the plan summary, the apply/destroy summaries, the approval prompts, the cancel text, the unknown-subcommand error with "Did you mean", the validate success message, the import success message and the workspace messages. Options go after the subcommand, except `-chdir`, which must come before it. A saved plan (`terraform apply tfplan`) applies without a prompt and cannot be combined with `-var`.

### Cited Findings

**Unknown subcommand** — [main.go](https://github.com/hashicorp/terraform/blob/main/main.go)
- Written to stderr with exit 1. The format is `"Terraform has no command named %q.%s\n\nTo see all of Terraform's top-level commands, run:\n  terraform -help\n\n"`, where `%s` is `" Did you mean %q?"` when there is a suggestion (from `didyoumean.NameSuggestion`). Rendered example:
  ```
  Terraform has no command named "plna". Did you mean "plan"?

  To see all of Terraform's top-level commands, run:
    terraform -help
  ```
- `-v`, `-version` and `--version` are rewritten to the `version` subcommand.
- `-chdir` errors: `Invalid -chdir option: must include an equals sign followed by a directory path, like -chdir=example` and `Error handling -chdir option: %s`.

**init** — [views/init.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/init.go)
- Section headers: `Initializing the backend...`, `Initializing provider plugins...`, `Initializing modules...`
- Provider lines: `- Finding latest version of %s...`, `- Installing %s v%s...`, `- Installed %s v%s (%s%s)`, `- Reusing version %s of %s from the dependency lock file`, `- Using previously-installed %s v%s`
- Backend: `Successfully configured the backend %q! Terraform will automatically` / `use this backend unless the backend configuration changes.`
- Success:
  ```
  Terraform has been successfully initialized!

  You may now begin working with Terraform. Try running "terraform plan" to see
  any changes that are required for your infrastructure. All Terraform commands
  should now work.

  If you ever set or change modules or backend configuration for Terraform,
  rerun this command to reinitialize your working directory. If you forget, other
  commands will detect it and remind you to do so if necessary.
  ```
- Empty directory: `Terraform initialized in an empty directory!` / `The directory has no Terraform configuration files. You may begin working` / `with Terraform immediately by creating Terraform configuration files.`

**validate** — [views/validate.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/validate.go)
- `Success! The configuration is valid.`, or `Success! The configuration is valid, but there were some validation warnings as shown above.`

**plan** — [jsonformat/plan.go](https://github.com/hashicorp/terraform/blob/main/internal/command/jsonformat/plan.go); [views/operation.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/operation.go)
- Header: `Terraform used the selected providers to generate the following execution plan.` then `Resource actions are indicated with the following symbols:`
- Legend: `+ create`, `~ update in-place`, `- destroy`, `-/+ destroy and then create replacement`
- Body: `Terraform will perform the following actions:`. Per-resource comments: `  # %s will be created`, `  # %s will be updated in-place`, `  # %s must be replaced`. Then `Changes to Outputs:`.
- Summary: `Plan: %d to add, %d to change, %d to destroy.` With imports, `%d to import, ` is prepended. With actions, ` Actions: %d to invoke.` is appended.
- No-op: `No changes. Your infrastructure matches the configuration.` then `Terraform has compared your real infrastructure against your configuration and found no differences, so no changes are needed.`
- With `-out`:
  ```
  Saved the plan to: %s

  To perform exactly these actions, run the following command to apply:
      terraform apply %q
  ```
- Without `-out`: `Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take exactly these actions if you run "terraform apply" now.`

**apply / destroy prompts and summaries** — [backend_apply.go](https://github.com/hashicorp/terraform/blob/main/internal/backend/local/backend_apply.go); [views/operation.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/operation.go); [views/apply.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/apply.go)
- Apply query: `Do you want to perform these actions?` In a non-default workspace: `Do you want to perform these actions in workspace "dev"?`
- Apply description: `Terraform will perform the actions described above.` / `Only 'yes' will be accepted to approve.`
- Destroy query: `Do you really want to destroy all resources?`
- Destroy description: `Terraform will destroy all your managed infrastructure, as shown above.` / `There is no undo. Only 'yes' will be accepted to confirm.`
- Any answer other than `yes` prints `Apply cancelled.` or `Destroy cancelled.` and the operation fails. A trivial plan (no changes) skips the prompt.
- Summaries: `Apply complete! Resources: %d added, %d changed, %d destroyed.`, the import variant `Apply complete! Resources: %d imported, %d added, %d changed, %d destroyed.`, `Destroy complete! Resources: %d destroyed.`, and then the `Outputs:` header.

**Flags (docs)**
- `terraform plan [options]` options:
  - `-out=FILENAME`
  - `-var 'NAME=VALUE'`
  - `-var-file=FILENAME`
  - `-target=ADDRESS`: "in exceptional circumstances only".
  - `-destroy`, `-refresh-only`, `-replace=ADDRESS`, `-input=false`, `-lock=false`
  - `-detailed-exitcode`: 0 = no changes, 1 = error, 2 = changes present.

  On Windows the docs recommend Command Prompt with double quotes and do not recommend PowerShell. — [terraform plan docs](https://developer.hashicorp.com/terraform/cli/commands/plan)
- `terraform apply [options] [plan file]`. With a saved plan it "performs the operations in the saved plan without prompting". `-auto-approve` "Skips interactive approval". "When using a saved plan, you cannot specify any additional planning modes or options." Other options: `-input=false`, `-lock=false`, `-parallelism=n` (default 10), `-replace`. — [terraform apply docs](https://developer.hashicorp.com/terraform/cli/commands/apply)

**import** — [import.go](https://github.com/hashicorp/terraform/blob/main/internal/command/import.go)
- `Usage: terraform [global options] import [options] ADDR ID`
- Success:
  ```
  Import successful!

  The resources that were imported are shown above. These resources are now in
  your Terraform state and will henceforth be managed by Terraform.
  ```
- Missing config:
  ```
  Error: resource address %q does not exist in the configuration.

  Before importing this resource, please create its configuration in %s. For example:

  resource %q %q {
    # (resource arguments)
  }
  ```

**workspace** — [workspace_command.go](https://github.com/hashicorp/terraform/blob/main/internal/command/workspace_command.go); [workspace_new.go](https://github.com/hashicorp/terraform/blob/main/internal/command/workspace_new.go)
- Usage: `Usage: terraform [global options] workspace` ("new, list, show, select and delete Terraform workspaces") and `Usage: terraform [global options] workspace new [OPTIONS] NAME`
- `Workspace %q already exists`
- `Workspace %q doesn't exist.` / `You can create this workspace with the "new" subcommand or include the "-or-create" flag with the "select" subcommand.`
- `Deleted workspace %q!`
- `Workspace %[1]q is your active workspace.` / `You cannot delete the currently active workspace. Please switch to another workspace and try again.`

**GCS backend** — [GCS backend docs](https://developer.hashicorp.com/terraform/language/backend/gcs)
- Block:
  ```hcl
  terraform {
    backend "gcs" {
      bucket  = "tf-state-prod"
      prefix  = "terraform/state"
    }
  }
  ```
- `bucket` is required and must already exist. Optional settings: `prefix`, `credentials` (or ADC), `impersonate_service_account`, `access_token`, `encryption_key`, `kms_encryption_key`, `storage_custom_endpoint`.
- Named workspaces are stored at `<prefix>/<name>.tfstate`. "This backend supports state locking."

### Inferences
- A rendered interactive prompt (RECONSTRUCTED layout; the query and description text are verified):
  ```
  Plan: 1 to add, 0 to change, 0 to destroy.

  Do you want to perform these actions?
    Terraform will perform the actions described above.
    Only 'yes' will be accepted to approve.

    Enter a value: 
  ```
- Grader rules:
  - Terraform uses Go's flag package, so `-auto-approve` and `--auto-approve` are both accepted, as are `-out=tfplan` and `-out tfplan`. This is general Go behaviour, not verified this session.
  - `-chdir=DIR` must precede the subcommand. `terraform apply -auto-approve` and `terraform apply tfplan` are distinct correct answers to "apply without prompting".
  - Common mistakes to flag:
    - `terraform apply -auto-approve tfplan` (redundant but valid)
    - `terraform apply tfplan -var x=1` (invalid with a saved plan)
    - `terraform plan -out tfplan.json` (the plan file is opaque, not JSON)
    - typing `y` at the prompt, which cancels
    - `terraform workspace create dev` (it's `new`)
    - `terraform import ID ADDR` (wrong order; it's `ADDR ID`)
- `terraform destroy` is the convenience alias for `terraform apply -destroy`. This is general knowledge; the apply doc page fetched here did not state it.

### Gaps
- `envCreated` (likely `Created and switched to workspace "dev"!` followed by a paragraph about the new, empty workspace) and `Switched to workspace "dev".` live in the views package, which was not fetched (RECONSTRUCTED).
- `terraform workspace list` output (`  default` / `* dev`) is RECONSTRUCTED.
- `state list` (one address per line, e.g. `google_storage_bucket.b`), `state show ADDRESS` (HCL-like attribute dump), `output` (`name = "value"`, plus `-raw` and `-json`) and `fmt` (prints changed filenames; `-check`, `-recursive`, `-diff`) were not verified against docs this session.
- The lock-file message (`Terraform has created a lock file .terraform.lock.hcl to record the provider selections it made above. Include this file in your version control repository...`) is RECONSTRUCTED; its constants were not in the fetched file.
- The empty-directory error from `terraform plan` (`Error: No configuration files`) is RECONSTRUCTED.

---

## Q5. docker: syntax, error strings, compose v2 and Artifact Registry push errors

### Takeaway
Docker CLI error wording has changed. On current CLIs (verified on 29.2.1), an unknown command prints `docker: unknown command: docker foo` and then `Run 'docker --help' for more information`. The old `docker: 'foo' is not a docker command.` is legacy. Argument-count errors read `docker: 'docker push' requires 1 argument`. `docker build` now routes to `docker buildx build`, so its error is `ERROR: docker: 'docker buildx build' requires 1 argument`. Flag errors exit with code 125. For Artifact Registry, use the image path `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG`. Pushes that are unauthenticated or lack permission fail with `denied: ... artifactregistry.repositories.uploadArtifacts ... (or it may not exist)`.

### Cited Findings

**Top-level and flag errors** — [LOCAL-D]
- Unknown command, exit 1:
  ```
  docker: unknown command: docker foo

  Run 'docker --help' for more information
  ```
- Unknown flag, exit 125:
  ```
  unknown flag: --foo

  Usage:  docker ps [OPTIONS]

  Run 'docker ps --help' for more information
  ```
- Unknown short flag, exit 125: `unknown shorthand flag: 'z' in -z`, then the `docker run` usage line `Usage:  docker run [OPTIONS] IMAGE [COMMAND] [ARG...]` and `Run 'docker run --help' for more information`.

**Argument-count errors** — [LOCAL-D]
All have exit 1. The footer is `Run '...' --help' for more information` or `See '...' --help' for more information` depending on the command.
- `docker: 'docker run' requires at least 1 argument` + `Usage:  docker run [OPTIONS] IMAGE [COMMAND] [ARG...]` + `See 'docker run --help' for more information`
- `docker: 'docker tag' requires 2 arguments` + `Usage:  docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]`
- `docker: 'docker push' requires 1 argument` + `Usage:  docker push [OPTIONS] NAME[:TAG]`
- `docker: 'docker pull' requires 1 argument` + `Usage:  docker pull [OPTIONS] NAME[:TAG|@DIGEST]`
- `docker: 'docker exec' requires at least 2 arguments` + `Usage:  docker exec [OPTIONS] CONTAINER COMMAND [ARG...]`
- `docker: 'docker logs' requires 1 argument` + `Usage:  docker logs [OPTIONS] CONTAINER`
- `docker: 'docker stop' requires at least 1 argument` / `docker: 'docker rm' requires at least 1 argument` / `docker: 'docker rmi' requires at least 1 argument`

**docker build** — [LOCAL-D]
- With BuildKit (the default), `docker build` and `docker build -t myapp` (no context) both give:
  ```
  ERROR: docker: 'docker buildx build' requires 1 argument

  Usage:  docker buildx build [OPTIONS] PATH | URL | -

  Run 'docker buildx build --help' for more information
  ```
  Passing 2 positionals gives the same error. Unknown flags give `unknown flag: --foo` with the buildx usage line.
- Legacy builder (`DOCKER_BUILDKIT=0`): a `DEPRECATED: The legacy builder is deprecated and will be removed in a future release.` banner, then `docker: 'docker build' requires 1 argument` and `Usage:  docker build [OPTIONS] PATH | URL | -`.
- Neither form matches the brief's expected `"docker build" requires exactly 1 argument.`, which is the pre-2024 CLI wording.

**History of the wording**
- Commit a6e96c758e ("cli: improve output and consistency for unknown (sub)commands") replaced the old `docker: 'nosuchcommand' is not a docker command.` / `See 'docker --help'` output. PR #5234 introduced `docker: unknown command: docker <name>` + `Run 'docker --help' for more information`. — [docker-cli mirror commit](https://git.coopcloud.tech/toolshed/docker-cli/src/commit/a6e96c758e3d3b41a2a81146342344eb82d1d4ec); [PR #5234 merge](https://git.coopcloud.tech/toolshed/docker-cli/commit/ce4469a6964f32a1556fa3d89fc0ee6461a2d477?files=cmd)

**Key flags** — [LOCAL-D] (`--help`)
- `run`: `-d, --detach`, `-e, --env list`, `--env-file`, `-i, --interactive`, `-t, --tty`, `--name`, `-p, --publish list`, `-P, --publish-all`, `--rm`, `--restart`, `--network`, `-v, --volume`, `-w, --workdir`
- `ps`: `-a, --all`, `-q, --quiet`, `-f, --filter`, `--format`, `-n, --last`, `-l, --latest`, `-s, --size`
- `logs`: `-f, --follow`, `-n, --tail`, `--since`, `-t, --timestamps`
- `exec`: `-i`, `-t`, `-d`, `-e`, `-u, --user`, `-w, --workdir`
- `build` (buildx): `-t, --tag stringArray`, `-f, --file`, `--build-arg`, `--platform`, `--no-cache`, `--push`, `--load`, `--target`
- `images`: `Usage:  docker images [OPTIONS] [REPOSITORY[:TAG]]`, `-a`, `-q`
- `rm`: `-f, --force` (SIGKILL), `-v, --volumes`; `rmi`: `-f, --force`
- `stop`: `-t, --timeout int`, `-s, --signal`

**Aliases**
- `docker container ls` has aliases `docker container list`, `docker container ps` and `docker ps` — [docker container ls docs](https://docs.docker.com/reference/cli/docker/container/ls/)

**Compose**
- `docker compose up [OPTIONS] [SERVICE...]` with `-d, --detach`, `--build`, `--force-recreate`, `--remove-orphans`, `--scale`. `docker compose down` with `-v, --volumes`, `--rmi`, `--remove-orphans`. The global `-f, --file` and `-p, --project-name` options come before the subcommand. — [LOCAL-D]
- `docker compose foo` prints the full compose usage and ends with `unknown docker command: "compose foo"` (exit 1). `docker compose up -d` in a directory without a compose file → `no configuration file provided: not found` — [LOCAL-D]
- The `docker-compose` binary shipped with Docker Desktop reports `Docker Compose version v5.0.2`, the same as `docker compose version`. So the hyphenated name is now a shim for the plugin, not Python v1. — [LOCAL-D]
- Compose V1 support ended after June 2023. Migration guidance: type `docker compose` instead of `docker-compose`. — [Docker blog](https://www.docker.com/blog/new-docker-compose-v2-and-v1-deprecation/)

**Daemon unreachable**
- On Windows Docker Desktop: `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; check if the path is correct and if the daemon is running: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.` — [LOCAL-D]
- The classic Linux message is `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`. Newer CLIs word it as "failed to connect to the docker API ...". — [Better Stack](https://betterstack.com/community/questions/how-to-fix-cannot-connect-to-docker-daemon-is-the-docker-daemon-running/); [Inventive HQ](https://inventivehq.com/knowledge-base/devops/cannot-connect-to-the-docker-daemon)

**Artifact Registry**
- Image path example: `us-west1-docker.pkg.dev/my-project/my-repo/my-image:v1`. The repository segment is mandatory, so `us-west1-docker.pkg.dev/my-project/my-image:v1` is invalid. Pushes fail if the repository doesn't exist ("Repository creation is a separate step from the first push") or if the account lacks `roles/artifactregistry.writer`. Pulls need `roles/artifactregistry.reader`. Pushing an already-used tag to a tag-immutable repo gives "The repository has enabled tag immutability". — [Artifact Registry Docker troubleshooting](https://docs.cloud.google.com/artifact-registry/docs/docker/troubleshoot)
- Permission error: `denied: Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "projects/xxx/..." (or it may not exist)`. A fix that worked: `gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://REGION-docker.pkg.dev`. Running docker under `sudo` reads `/root/.docker` credentials instead. — [Google Developer forum thread](https://discuss.google.dev/t/permission-artifactregistry-repositories-uploadartifacts-denied-on-resource-projects-xxx/107225)
- Unauthenticated variant: `denied: Unauthenticated request. Unauthenticated requests do not have permission "artifactregistry.repositories.uploadArtifacts" on resource "projects/xxx/locations/us/repositories/gcr.io" (or it may not exist)` — [QuickChart community](https://community.quickchart.io/t/denied-unauthenticated-request-unauthenticated-requests-do-not-have-permission-artifactregistry-repositories-uploadartifacts/629)
- `gcloud auth configure-docker` does not grant upload permission, and a typo in the location, project or repo can look like an IAM failure. — [OneUptime (Aug 2026, secondary)](https://oneuptime.com/blog/post/2026-08-27-fix-artifact-registry-uploadartifacts-denied/view)

### Inferences
- Grader rules:
  - Docker flags must appear *before* the image name in `docker run`. Anything after IMAGE becomes the container command, so `docker run nginx -d -p 8080:80` is wrong.
  - `-p HOST:CONTAINER` puts the host port first. Reversed ports are a classic mistake.
  - Treat `-it`, `-ti` and `-i -t` as the same.
  - Treat `--name web` and `--name=web` as the same.
  - `docker build -t TAG .` needs the context path. A missing `.` gives the buildx "requires 1 argument" error.
  - Image references must be lowercase. A simulated error for an uppercase name: `invalid reference format: repository name (library/MyApp) must be lowercase` (RECONSTRUCTED).
- Accept `docker compose up -d` (v2) as canonical. Optionally accept `docker-compose up -d` with a note that it is legacy.
- For an AR push simulation, before `gcloud auth configure-docker us-central1-docker.pkg.dev` the realistic output is the "Unauthenticated request" denial. After auth, but without writer, it is the "Permission ... denied" form. A missing repo shows the same denial thanks to the "(or it may not exist)" suffix.
- A realistic preceding push transcript (RECONSTRUCTED):
  ```
  The push refers to repository [us-central1-docker.pkg.dev/my-project/my-repo/web]
  5f70bf18a086: Preparing
  ...
  ```

### Gaps
- No source was found for `unauthorized: authentication failed` from Artifact Registry this session. It may be the Docker Hub or other-registry wording.
- Common daemon errors were not captured because the daemon was down. Likely forms (RECONSTRUCTED):
  - `docker: Error response from daemon: Conflict. The container name "/web" is already in use by container "<id>". You have to remove (or rename) that container to be able to reuse that name.`
  - `Error response from daemon: No such container: web`
  - `Unable to find image 'nginx:latest' locally`
  - `Error response from daemon: conflict: unable to remove repository reference "x" (must force) - container <id> is using its referenced image <id>`
- The exact Linux wording of the new "failed to connect to the docker API at unix:///var/run/docker.sock ..." message is inferred by analogy with the Windows capture.
- The Docker CLI release that first shipped the new unknown-command wording was not identified. It is confirmed present in 29.2.1.

---

## Q6. Realistic short sample outputs (tables and columns)

### Takeaway
Verified table shapes exist for kubectl `get deployments`, `get pods` (including `--show-labels` and `ImagePullBackOff`), `get services`, `describe service`, `rollout status/history/undo`, `config get-contexts`, and `docker ps -a`. Older kubectl docs pad columns more widely than current kubectl. Current kubectl uses three spaces between columns, as the `get-contexts` capture shows. The `get nodes`, `top` and `bq ls` tables are reconstructed.

### Cited Findings
- `kubectl get deployments` — [Deployments page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/):
  ```
  NAME               READY   UP-TO-DATE   AVAILABLE   AGE
  nginx-deployment   3/3     3            3           18s
  ```
- `kubectl rollout status deployment/nginx-deployment` → `Waiting for rollout to finish: 2 out of 3 new replicas have been updated...` then `deployment "nginx-deployment" successfully rolled out` — [Deployments page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- `kubectl get pods`, including an image-pull failure — [Deployments page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/):
  ```
  NAME                                READY     STATUS             RESTARTS   AGE
  nginx-deployment-1564180365-70iae   1/1       Running            0          25s
  nginx-deployment-3066724191-08mng   0/1       ImagePullBackOff   0          6s
  ```
  `--show-labels` adds a trailing `LABELS` column, e.g. `app=nginx,pod-template-hash=75675f5897`.
- `kubectl rollout history deployment/nginx-deployment` — [Deployments page](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/):
  ```
  deployments "nginx-deployment"
  REVISION    CHANGE-CAUSE
  1           <none>
  2           <none>
  3           <none>
  ```
  `kubectl rollout undo deployment/nginx-deployment [--to-revision=2]` → `deployment.apps/nginx-deployment rolled back`.
- `kubectl get services my-service` — [expose tutorial](https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/):
  ```
  NAME         TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)    AGE
  my-service   LoadBalancer   10.3.245.137   104.198.205.71   8080/TCP   54s
  ```
  `kubectl describe services my-service` shows the fields `Name:`, `Namespace:`, `Labels:`, `Annotations:`, `Selector:`, `Type:`, `IP:`, `LoadBalancer Ingress:`, `Port: <unset> 8080/TCP`, `NodePort: <unset> 32377/TCP`, `Endpoints: 10.0.0.6:8080,... + 2 more...`, `Session Affinity: None`, `Events: <none>`. `kubectl get pods --output=wide` adds `IP` and `NODE` columns (GKE node names like `gke-cluster-1-default-pool-e0b8d269-1afc`).
- `kubectl config get-contexts` — [LOCAL-K]:
  ```
  CURRENT   NAME                                   CLUSTER                                AUTHINFO   NAMESPACE
            dev                                    gke_my-project_us-central1_cluster-1   gke-user   dev
  *         gke_my-project_us-central1_cluster-1   gke_my-project_us-central1_cluster-1   gke-user   staging
  ```
- `docker ps -a` (header plus rows) — [docker container ls docs](https://docs.docker.com/reference/cli/docker/container/ls/):
  ```
  CONTAINER ID        IMAGE             COMMAND                CREATED             STATUS                   PORTS                      NAMES
  ea09c3c82f6e        registry:latest   /srv/run.sh            2 weeks ago         Exited (0) 2 weeks ago   127.0.0.1:5000->5000/tcp   desperate_leakey
  ```
  A published-port example from the same page: `0.0.0.0:32768->80/tcp`, with status `Up 50 seconds`.
- `bq ls --datasets=true` lists under a `datasetId` header. Load output is `Upload complete.` + `Waiting on bqjob_... (1s) Current status: DONE`. — [bq quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq)

### Inferences
These sample tables are RECONSTRUCTED, using standard current column sets with three-space column padding:
```
$ kubectl get nodes
NAME                                       STATUS   ROLES    AGE   VERSION
gke-cluster-1-default-pool-1a2b3c4d-x7k2   Ready    <none>   12d   v1.33.5-gke.1080000

$ kubectl get pods -o wide
NAME                   READY   STATUS    RESTARTS   AGE   IP          NODE                                       NOMINATED NODE   READINESS GATES
web-7d4b9c8f6d-abcde   1/1     Running   0          5m    10.8.0.12   gke-cluster-1-default-pool-1a2b3c4d-x7k2   <none>           <none>

$ kubectl get svc
NAME         TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP      10.12.0.1     <none>        443/TCP        12d
web          LoadBalancer   10.12.5.140   <pending>     80:31234/TCP   10s

$ kubectl top pods
NAME                   CPU(cores)   MEMORY(bytes)
web-7d4b9c8f6d-abcde   2m           12Mi

$ kubectl get hpa
NAME   REFERENCE        TARGETS       MINPODS   MAXPODS   REPLICAS   AGE
web    Deployment/web   cpu: 5%/80%   1         5         1          2m

$ docker ps
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                                     NAMES
3f2a1b4c5d6e   nginx:latest   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp   web

$ bq ls mydataset
   tableId    Type    Labels   Time Partitioning   Clustered Fields
 ----------- ------- -------- ------------------- ------------------
  orders      TABLE
  orders_v    VIEW
```
- For a LoadBalancer Service, `EXTERNAL-IP` shows `<pending>` until GCP provisions the IP. A realistic simulation should flip `<pending>` to an IP after a short delay, since the tutorial shows the populated form.
- Modern `docker ps` uses three-space padding and shows the COMMAND field quoted and truncated with `…`. The docs sample above is older, wide-padded output.

### Gaps
- A verbatim current `kubectl get nodes`, `kubectl top` or `kubectl get hpa` table was not fetched. The HPA `TARGETS` format changed in recent versions (e.g. `cpu: 5%/80%` vs `5%/80%`), and this is unverified.
- No first-party verbatim `bq ls` table listing, `bq show` table summary (`Last modified  Schema  Total Rows  Total Bytes ...`) or `bq query` pretty result grid was retrieved.

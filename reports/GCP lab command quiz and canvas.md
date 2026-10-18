# Reproduce Google Cloud's parsers, errors and wiring

A credible browser-only ACE lab needs two engines that copy Google Cloud's real behaviour. The command quiz should parse each typed line with a model of that CLI's actual grammar, reduce it to a canonical form, and print failures from the tools' own format strings. The canvas should check every connection against a rule table with five questions: does a mechanism exist for this pair, does the calling identity hold the right role on the right resource, are the APIs enabled, is there a network path, and do the locations match. Grading by exact string fails both ways. gcloud accepts `--flag=value` and `--flag value`, lowercases some enum values but not others, and still runs `gcloud config get-value` as a hidden alias. Its own cheat sheet even lists a command, `gcloud iam service-accounts set-iam-policy-binding`, that does not exist and whose reference URL returns 404 ([Cheat sheet](https://docs.cloud.google.com/sdk/docs/cheatsheet)). The error output is exact and changed in 2026. gcloud writes `ERROR: (gcloud.<dotted.path>) …` to stderr. It exits **2** on parse errors and **1** on runtime errors, and it never prints argparse's "the following arguments are required". In SDK 589.0.0 it answers `gcloud auth init` with `Invalid choice: 'init'.` followed by a `Maybe you meant:` list ([parser_extensions.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py)). `gcloud init` now says "You must sign in to continue" and ends with "The Google Cloud CLI is configured and ready to use!" ([init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)). For the canvas, each source supplies a different layer. n8n supplies the look, Cisco Packet Tracer supplies the feedback, and Google's Application Design Center (ADC) supplies the meaning of a connection. In ADC, connecting Cloud Run to Cloud SQL writes `roles/cloudsql.client` and `roles/cloudsql.instanceUser` into the generated Terraform ([ADC: Configure Cloud Run](https://docs.cloud.google.com/application-design-center/docs/configure-cloud-run)). Realistic IAM matters more now than before. In organizations created after May 3, 2024, default service accounts no longer get Editor automatically, so every edge needs an explicit grant ([Compute service accounts](https://docs.cloud.google.com/compute/docs/access/service-accounts)). The failures a learner will meet are documented word for word, for example "Your client does not have permission to get URL from this server" and "Permission 'iam.serviceAccounts.actAs' denied on service account" ([Cloud Run troubleshooting](https://docs.cloud.google.com/run/docs/troubleshooting)).

## Grade commands by parsing them the way each CLI parses them

A typed answer should go through the same stages as the real tool:

1. Tokenize the line with shell quoting rules.
2. Route on `argv[0]` to that tool's grammar.
3. Walk a static command tree until the first unknown token.
4. Bind flags against a per-command spec covering long names, short aliases, `--[no-]` booleans, enum choices, required flags, mutually exclusive groups and deprecations.
5. Fill implicit values from simulated configuration, such as `core/project`, `compute/zone`, `run/region` or the kubectl context namespace.

The result is a canonical record of the form `{tool, commandPath, positionals, sorted normalized flags}`. Compare it with an answer key that lists every accepted equivalent. The same pass produces the real error whenever parsing fails, so the learner sees exactly what Cloud Shell would print before any tutoring hint appears. gcloud's documented anatomy, "gcloud + release level (optional) + component + entity + operation + positional args + flags", maps directly onto that command tree ([Cheat sheet](https://docs.cloud.google.com/sdk/docs/cheatsheet)). Every gcloud command also accepts the same global flags: `--account`, `--billing-project`, `--configuration`, `--flags-file`, `--flatten`, `--format`, `--impersonate-service-account`, `--project`, `--quiet`, `--verbosity` and others ([compute networks create ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/create)).

**Case handling has to be set per flag, not globally.** `--subnet-mode` is parsed through `mode.lower()`, so `--subnet-mode=CUSTOM` is valid ([network_utils.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/compute/networks/network_utils.py)). The protocol names in `firewall-rules create --allow` are "(case-sensitive) string values tcp, udp, icmp, esp, ah, sctp" ([firewall-rules create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/firewall-rules/create)). The required-flag spec is where most of the grading value is. The reference pages mark these flags as required:

- `--member` and `--role` on `projects add-iam-policy-binding`
- `--key-file` on `auth activate-service-account`
- `--size` on `compute disks resize`
- `--size` and `--template` on `instance-groups managed create`
- `--max-num-replicas` on `set-autoscaling`
- `--version` on `rolling-action start-update`
- `--network` on `networks subnets create`
- `--router` on `routers nats create`
- `--dns-name` on `dns managed-zones create`
- `--repository-format` on `artifacts repositories create`
- `--topic` on `pubsub subscriptions create`
- `--splits` on `app services set-traffic`

Three commands instead demand exactly one flag from a group:

- `firewall-rules create`: `--action` or `--allow`
- `iam roles create`: `--organization` or `--project`
- `deployment-manager deployments create`: `--composite-type`, `--config` or `--template`

Sources: [add-iam-policy-binding](https://docs.cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding), [MIG create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-groups/managed/create), [nats create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/routers/nats/create), [artifacts repositories create](https://docs.cloud.google.com/sdk/gcloud/reference/artifacts/repositories/create), [iam roles create](https://docs.cloud.google.com/sdk/gcloud/reference/iam/roles/create).

The other four CLIs each break a different assumption that string matching relies on.

| Tool | How it parses | Treat as equivalent | Reject, or accept with a hint |
|---|---|---|---|
| **gcloud** (589.0.0) | argparse command tree with `ERROR: (gcloud.path)` diagnostics | `--flag=v` and `--flag v`; `config get` and the hidden alias `config get-value` (hidden since 374.0.0) ([get_value.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/config/get_value.py)); `functions deploy --gen2`, which is redundant since 492.0.0 made 2nd gen the default ([RELEASE_NOTES](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/RELEASE_NOTES)) | Reject `iam service-accounts set-iam-policy-binding`. Accept with a deprecation hint `container clusters resize --size` ("Please use --num-nodes") ([resize](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/resize)), `--subnet-mode=legacy`, `peerings create --auto-create-routes`, `set-autoscaling --mode only-up`, the positional NAME on `instances list`, and `--additional-zones` (use `--node-locations`). Reject `--trigger-topic=projects/…/topics/…`, because the flag "does not accept" that format ([functions deploy](https://docs.cloud.google.com/sdk/gcloud/reference/functions/deploy)) |
| **kubectl** (1.34) | `kubectl [command] [TYPE] [NAME] [flags]`; TYPE is case-insensitive and can be singular, plural or a short name; "Names are case-sensitive" ([kubectl reference](https://kubernetes.io/docs/reference/kubectl/)) | `po`/`pod`/`pods`; `deploy`/`deployment`/`deployment.apps`/`deployment.v1.apps`; `TYPE NAME` and `TYPE/NAME`; `-n X` and `--namespace=X`; `-it` and `-i -t`; `--replicas 3` and `--replicas=3`. `secrets` and `jobs` have **no** short name | `exec POD sh` without `--` is now a hard error. `autoscale --cpu-percent` is deprecated in favour of `--cpu=80%`, but still runs and prints a warning. Also flag `set image deployment/web nginx:1.25` (missing `CONTAINER=`) and `drain` on GKE without `--ignore-daemonsets` (both observed with kubectl v1.34.1 during research) |
| **bq** | `bq COMMAND [FLAGS] [ARGUMENTS]`; "Place any global flags before the `bq` command" ([bq reference](https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference)); absl flags | `-d` and `--dataset`; `PROJECT:DATASET` and `DATASET`; schema given as a trailing positional (`name:TYPE,…` or a `.json` path) or as `--schema` ([tables](https://docs.cloud.google.com/bigquery/docs/tables)) | Hint when `--use_legacy_sql=false` is missing on GoogleSQL questions. Hint on `project.dataset` where the CLI expects `project:dataset`. Hint on JSON loads that lack `--source_format=NEWLINE_DELIMITED_JSON`, because CSV is the default |
| **terraform** | Options go after the subcommand, except `-chdir`, which must come before it. `-v`, `-version` and `--version` are rewritten to `version` ([main.go](https://github.com/hashicorp/terraform/blob/main/main.go)) | `apply -auto-approve` and `apply tfplan` are both correct answers to "apply without prompting" ([apply docs](https://developer.hashicorp.com/terraform/cli/commands/apply)) | Reject `apply tfplan -var x=1`: "When using a saved plan, you cannot specify any additional planning modes or options". Reject `workspace create` (the subcommand is `new`) and `import ID ADDR` (the usage is `import [options] ADDR ID`) ([import.go](https://github.com/hashicorp/terraform/blob/main/internal/command/import.go)) |
| **docker** (29.x) | cobra-style; in `run`, everything after IMAGE becomes the container command | `-it`, `-ti` and `-i -t`; `--name web` and `--name=web`; `docker compose` (v2). `docker-compose` is now a shim for the same plugin, and V1 support ended after June 2023 ([Docker blog](https://www.docker.com/blog/new-docker-compose-v2-and-v1-deprecation/)) | Reject `docker run nginx -d -p 8080:80` (flags after the image), reversed `-p` ports, and `docker build -t app` with no context path. Reject Artifact Registry paths that omit the repository segment, because `REGION-docker.pkg.dev/PROJECT/IMAGE` is invalid ([AR Docker troubleshooting](https://docs.cloud.google.com/artifact-registry/docs/docker/troubleshoot)) |

The kubectl deprecation line is worth reproducing verbatim (captured from v1.34.1): `Flag --cpu-percent has been deprecated, Use --cpu with percentage or resource quantity format (e.g., '70%' for utilization or '500m' for milliCPU).` Most ACE study material still teaches `--cpu-percent=80`, so the grader should accept it and print the warning.

**Cloud Storage questions need an equivalence table, because two CLIs are correct.** The bundled gsutil 5.37 README calls gsutil "a legacy Cloud Storage CLI and minimally maintained", and says it lacks soft delete and managed folders ([gsutil README](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/README.md)). The grader should therefore treat `gcloud storage` as canonical and gsutil as "legacy, still works". The mappings below are taken from Google's transition table and the gsutil synopses ([transition](https://docs.cloud.google.com/storage/docs/gsutil-transition-to-gcloud), [mb.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/mb.py), [iam.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/iam.py), [rsync.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/rsync.py), [buckets create](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create)). Two traps in this table are worth grading explicitly. First, gsutil's `-b on` takes a value, but the gcloud `-b` is a bare boolean. Second, gsutil's `-m` is a top-level option that goes *before* the command.

| gsutil (legacy) | `gcloud storage` equivalent |
|---|---|
| `gsutil mb -l US -c NEARLINE -b on gs://b` | `gcloud storage buckets create gs://b --location=US --default-storage-class=NEARLINE --uniform-bucket-level-access` |
| `gsutil versioning set on gs://b` | `gcloud storage buckets update gs://b --versioning` |
| `gsutil lifecycle set f.json gs://b` | `gcloud storage buckets update gs://b --lifecycle-file=f.json` |
| `gsutil rewrite -s COLDLINE gs://b/o` | `gcloud storage objects update gs://b/o --storage-class=COLDLINE` |
| `gsutil iam ch user:a@x.com:objectViewer gs://b` | `gcloud storage buckets add-iam-policy-binding gs://b --member=user:a@x.com --role=roles/storage.objectViewer` |
| `gsutil signurl -d 10m key.json gs://b/o` | `gcloud storage sign-url gs://b/o --duration=10m --private-key-file=key.json` |
| `gsutil retention set 1y gs://b` | `gcloud storage buckets update gs://b --retention-period=1y` |
| `gsutil -m rsync -r -d ./dir gs://b` | `gcloud storage rsync ./dir gs://b -r --delete-unmatched-destination-objects` |
| `gsutil stat gs://b/o` | `gcloud storage objects describe gs://b/o` |

The answer key should also reflect the 2024–2026 renames:

- **Container Registry**: Google says "writing images to Container Registry is unavailable" since **March 18, 2025**. New-build answers that use `gcr.io/...` should be flagged in favour of `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE` ([Container Registry deprecation](https://docs.cloud.google.com/container-registry/docs/deprecations/container-registry-deprecation)). Google's sources disagree on when reads ended (June 3 vs May 20, 2025).
- **Cloud Functions**: renamed Cloud Run functions on August 21, 2024 ([functions release notes](https://docs.cloud.google.com/functions/docs/release-notes)). `gcloud run deploy --function` has been GA since 511.0.0 ([RELEASE_NOTES 589](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/RELEASE_NOTES)), so `gcloud run deploy --source . --function=ENTRY` is an equally correct deploy answer.
- **Deployment Manager**: reached end of support on **March 31, 2026**, although some localized pages say December 31, 2025 ([DM deprecations](https://docs.cloud.google.com/deployment-manager/docs/deprecations)). Its reference pages still load. Treat its syntax as documented but steer new IaC questions to Terraform.

Each answer then lands in one of four outcomes:

- **Correct.**
- **Correct with a hint.** This covers legacy aliases, gsutil forms, redundant flags, and deprecated flags. Deprecated flags should print their real warning.
- **Valid but wrong.** The command parses but names the wrong region, role or resource. Answer with the simulated runtime result, not a parse error.
- **Invalid.** Print the CLI's real error and exit code.

## Render failures from source templates; gcloud parse errors exit 2

Every gcloud error reaches stderr through a console formatter, `'%(levelname)s:' + ' %(message)s'`, as `ERROR: (gcloud.<dotted.command.path>) <message>` ([log.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/log.py)). Parse errors call `self.exit(2, …)` and skip the main exception handler. Runtime errors go through `sys.exit(getattr(exc, 'exit_code', 1))` ([parser_errors.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/parser_errors.py), [calliope/exceptions.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/exceptions.py)). These exit codes matter in a terminal UI, because `echo $?` and `&&` chains must behave correctly. A one-line parse message is followed by a `Usage:` block. That block ends "For detailed information on this command and its flags, run:" followed by `  {command_path} --help`. Multi-line messages get no usage block ([usage_text.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/usage_text.py)). In usage strings, required groups appear as `(...)`, optional ones as `[...]`, and repeated positionals as `{var} [{var} ...]`. **gcloud deliberately swallows argparse's "too few arguments" and "arguments are required" messages** so that its own validator can print "Must be specified." instead ([parser_extensions.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py)). A simulator that prints "the following arguments are required" is immediately recognisable as fake.

| Situation | What gcloud prints (templates verbatim; example values illustrative) | Exit | Source |
|---|---|---|---|
| Missing required arg | `ERROR: (gcloud.projects.add-iam-policy-binding) argument --member --role: Must be specified.` followed by the Usage block | 2 | [parser_errors](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/parser_errors.py) |
| Required mutex | `Exactly one of (--action \| --allow) must be specified.` | 2 | same |
| Optional mutex | `At most one of {conflict} can be specified.` | 2 | same |
| Unknown flag | `unrecognized arguments: --zonee=us-central1-a (did you mean '--zone'?)`, a blank line, then `To search the help text of gcloud commands, run:` / `  gcloud help -- SEARCH_TERMS` | 2 | [parser_extensions](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py) |
| Bad enum, no close match | `argument --subnet-mode: Invalid choice: 'x'.`, a blank line, then `Valid choices are [auto, custom, legacy].` | 2 | same |
| Bad enum, close match | `argument --subnet-mode: Invalid choice: 'customs'. Did you mean 'custom'?` | 2 | same |
| Unknown command or group | `Invalid choice: 'init'.`, then `Maybe you meant:` with suggestions, then the help hint | 2 | same |
| Command exists in another release track | `This command is available in one or more alternate release tracks.  Try:` (note the two spaces before "Try"), observed as `ERROR: (gcloud.beta) Invalid choice: 'components'.` | 2 | [classmethod](https://dev.classmethod.jp/articles/gcloud-cli-has-3-release-level/) |
| Group with no command | `Command name argument expected.` followed by the categorical usage | 2 | [parser_extensions](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py) |
| Unset property | `The required property [project] is not currently set.` plus the body shown below | 1 | [properties.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/properties.py) |
| Zone cannot be resolved (non-interactive) | `Underspecified resource [vm-1]. Specify the [--zone] flag.` | 1 | [compute/flags.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/compute/flags.py) |
| Bad config key | `Section [{s}] has no property [{p}].` | 1 | [properties.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/properties.py) |
| API failure | `Could not fetch resource:` / ` - Required 'compute.images.useReadOnly' permission for '…'` (observed) | 1 | [LF forum](https://forum.linuxfoundation.org/discussion/comment/21045/) |

Rows for unknown flags and bad enum values need a few more details. When several unknown flags appear, each goes on its own `\n  `-indented line. A flag that exists in another release track adds "flag is available in one or more alternate release tracks. Try:". The "Maybe you meant" block works as follows in SDK 589. It triggers when the error is one line, contains "Invalid choice" and lacks "Valid choices". gcloud then scores the input against its static completion tree with `MIN_RATIO = 0.7`, returns at most 10 suggestions, and applies a synonym map (`make`→`create`, `show`/`get`→`describe`, `modify`/`patch`/`change`→`update`, `delete`→`remove`, `instance`↔`instances`). For a non-root group it also lists every visible subcommand of that group. It removes duplicates and drops a parent group whenever one of its children is already suggested. If it ends up with no suggestions, it prints the usage block instead ([parser_extensions.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py), [suggest_commands.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/suggest_commands.py)). **The subcommand-listing behaviour is present in 589 but absent from 562 (March 2026), so it is a 2026 change.** Pin the simulator to one SDK version. Older Cloud Shell images showed only similarity suggestions, or the usage block. Below is a source-derived reconstruction for 589. No live transcript of a `Maybe you meant:` block was found, and the exact list depends on the completion tree, so the `gcloud init` line is plausible rather than confirmed:

```
$ gcloud auth init
ERROR: (gcloud.auth) Invalid choice: 'init'.
Maybe you meant:
  gcloud init
  gcloud auth activate-service-account
  gcloud auth application-default
  gcloud auth configure-docker
  gcloud auth describe
  gcloud auth enterprise-certificate-config
  gcloud auth list
  gcloud auth login
  gcloud auth print-access-token
  gcloud auth print-identity-token
  gcloud auth revoke

To search the help text of gcloud commands, run:
  gcloud help -- SEARCH_TERMS
```

The `auth` subcommand list is real: it matches the files in `lib/surface/auth`, and there is no `init` ([surface/auth](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/tree/master/lib/surface/auth)).

**State-dependent errors are what make the terminal feel alive, and the strings below are all in the source.** A command with no project set raises this exact body. Skills Boost learners paste it in lab reviews ([properties.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/properties.py), [Skills Boost reviews](https://www.skills.google/focuses/19465/reviews?page=2231)):

```
ERROR: (gcloud.compute.instances.list) The required property [project] is not currently set.
It can be set on a per-command basis by re-running your command with the [--project] flag.

You may set it for your current workspace by running:

  $ gcloud config set project VALUE

or it can be set temporarily by the environment variable [CLOUDSDK_CORE_PROJECT]
```

Interactive compute commands prompt instead of failing. The prompts use these templates: `'Did you mean {0} [{1}] for {2}: [{3}]'` (Y/n), `'No {0} specified. Using {0} [{1}] for {2}: [{3}].'`, or a numbered list followed by `Please enter your numeric choice:  ` ([scope_prompter.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/compute/scope_prompter.py), [console_io.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/console/console_io.py)). `gcloud config set` prints `Updated property [core/project].` on success. It warns `You do not appear to have access to project [{}] or it does not exist.` and rejects zones with `{} is not a valid zone. Run \`gcloud compute zones list\` to get all zones.` ([config_validators.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/config/config_validators.py)). Cloud Shell is a package-managed install, so `gcloud components update` there prints "You cannot perform this action because the Google Cloud CLI component manager is disabled for this installation" ([update_manager.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/updater/update_manager.py)). That detail is authentic and easy to add.

Storage errors come in three styles, depending on the tool:

- `gcloud storage` prints `The following URLs matched no objects or files:` and `gs://nope not found: 404.` ([name_expansion.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/storage/name_expansion.py), [storage errors.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/api_lib/storage/errors.py)).
- gsutil prefixes every failure with `CommandException:` and exits 1, for example `CommandException: The mb command requires at least 1 argument. Usage:` followed by the synopsis and `For additional help run:` / `  gsutil help mb` ([gslib/command.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/command.py)). For an unknown command it first prints `Did you mean this?` with tab-indented suggestions ([command_runner.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/command_runner.py)).
- A taken bucket name returns the API's 409 text verbatim: "The requested bucket name is not available. The bucket namespace is shared by all users of the system. Please select a different name and try again." ([XML status codes](https://docs.cloud.google.com/storage/docs/xml-api/reference-status)).

The other CLIs have equally distinctive shapes. Copy them exactly; a learner who sees the wrong footer will spot it.

| Tool | Unknown command | Unknown flag | Missing argument | Exit and footer rules |
|---|---|---|---|---|
| kubectl v1.34.1 (captured locally) | `error: unknown command "gt" for "kubectl"`, a blank line, `Did you mean this?`, then tab-indented `set`, `get`, `cp` | `error: unknown flag: --foo` then `See 'kubectl get --help' for usage.` | `error: required flag(s) "image" not set`; `error: exactly one NAME is required, got 0` then `See 'kubectl create deployment -h' for help and examples` | Exit 1. Flag errors use the `--help' for usage.` footer; argument errors use `-h' for help and examples`. `Run 'kubectl --help' for usage.` no longer appears |
| bq | Not found in any source | `FATAL Flags parsing error: …` then `Pass --helpshort or --helpfull to see help on flags.` ([absl app.py](https://github.com/abseil/abseil-py/blob/main/absl/app.py)) | Operation failures: `BigQuery error in %s operation: %s`, `Error in query string: %s` ([bq.py mirror](https://github.com/yoheimuta/google-bigquery-tools/blob/master/bq/bq.py)) | Exit 1 for absl flag errors |
| terraform | `Terraform has no command named "plna". Did you mean "plan"?` then `To see all of Terraform's top-level commands, run:` / `  terraform -help` ([main.go](https://github.com/hashicorp/terraform/blob/main/main.go)) | Not collected; `-chdir` misuse prints `Invalid -chdir option: must include an equals sign followed by a directory path, like -chdir=example` | `Usage: terraform [global options] import [options] ADDR ID` | Exit 1; `plan -detailed-exitcode` returns 0 (no changes), 1 (error), 2 (changes) ([plan docs](https://developer.hashicorp.com/terraform/cli/commands/plan)) |
| docker 29.2.1 (captured locally) | `docker: unknown command: docker foo`, a blank line, then `Run 'docker --help' for more information` ([wording change commit](https://git.coopcloud.tech/toolshed/docker-cli/src/commit/a6e96c758e3d3b41a2a81146342344eb82d1d4ec)) | `unknown flag: --foo`, then `Usage:  docker ps [OPTIONS]`, then `Run 'docker ps --help' for more information` | `docker: 'docker push' requires 1 argument`; `ERROR: docker: 'docker buildx build' requires 1 argument` | Unknown command exits 1; flag errors exit **125**. The old `'foo' is not a docker command.` and `"docker build" requires exactly 1 argument.` are pre-2024 wording |

Several other strings are high-value. All of the kubectl ones were captured from v1.34.1:

- `error: exec [POD] [COMMAND] is not supported anymore. Use exec [POD] -- [COMMAND] instead`
- `error: must specify one of -f and -k`
- `error: You must provide one or more resources by argument or filename.`
- `error: no context exists with the name: "foo"`
- The classic Linux message `The connection to the server localhost:8080 was refused - did you specify the right host or port?`. This is the right failure to show before `gcloud container clusters get-credentials` has run ([Kubernetes Discuss](https://discuss.kubernetes.io/t/the-connection-to-the-server-localhost-8080-was-refused-did-you-specify-the-right-host-or-port/1464)).
- The GKE drain refusal is built from the constant `cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore)` ([drain filters.go](https://github.com/kubernetes/kubectl/blob/master/pkg/drain/filters.go)).
- bq's dry run prints `Query successfully validated. Assuming the tables are not modified, running this query will process 10918 bytes of data.` ([estimate costs](https://docs.cloud.google.com/bigquery/docs/estimate-costs)).
- bq's remove confirmation is `rm: remove dataset 'myproject:babynames'? (y/N)` ([bq quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq)).
- Terraform's approval prompt is `Do you want to perform these actions?`, followed by `Terraform will perform the actions described above.` and `Only 'yes' will be accepted to approve.`. Any answer other than `yes`, including `y`, prints `Apply cancelled.` ([views/operation.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/operation.go), [backend_apply.go](https://github.com/hashicorp/terraform/blob/main/internal/backend/local/backend_apply.go)).
- Artifact Registry push failures have two stages. Before `gcloud auth configure-docker` you get `denied: Unauthenticated request. Unauthenticated requests do not have permission "artifactregistry.repositories.uploadArtifacts" on resource "…" (or it may not exist)`. After auth but without the writer role you get `denied: Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "…" (or it may not exist)` ([QuickChart community](https://community.quickchart.io/t/denied-unauthenticated-request-unauthenticated-requests-do-not-have-permission-artifactregistry-repositories-uploadartifacts/629), [Google Developer forum](https://discuss.google.dev/t/permission-artifactregistry-repositories-uploadartifacts-denied-on-resource-projects-xxx/107225)).

Some outputs remain unverified. These include gcloud's runtime wording for deprecated flags, server-side 403 and 409 bodies as gcloud prints them, bq's unknown-command text and kubectl's `AlreadyExists` line. Label all of them as reconstructed in the simulator's data.

## `gcloud init` now says "sign in" and calls itself the Google Cloud CLI

The 589 source has replaced the wording most people remember. The opening is still `Welcome! This command will take you through the configuration of gcloud.`. The account prompt is now `You must sign in to continue. Would you like to sign in (selecting "Y" will open your browser to the sign-in page where you complete authentication)` followed by ` (Y/n)?  `. With `--console-only` or `--no-browser`, the parenthetical becomes `selecting "Y" will display a link that can be opened in your browser to complete authentication`. The summary opens with `The Google Cloud CLI is configured and ready to use!` and its tips mention "advanced features of the CLI" ([init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)). Older transcripts show "To continue, you must log in. Would you like to log in (Y/n)?" and "gcloud has now been configured!". **Those are obsolete; do not use them** ([legacy notes](https://github.com/jimbrig/obsidian_published/blob/main/docs/GCP/Install%20gcloud%20SDK%20on%20Ubuntu.md)).

The official flow runs in this order: authorize, create or select a configuration, pick a project, then set a default zone. If the account has more than 200 projects, the project step offers enter-an-ID, create or list instead of a full list. The zone step is skipped when the Compute Engine API is disabled or a default already exists ([Initializing the gcloud CLI](https://docs.cloud.google.com/sdk/docs/initializing)). Two edge cases have exact strings. Running `--quiet` fails with `gcloud init command cannot run with disabled prompts.`. Passing a positional PROJECT fails with "`gcloud init` has changed and no longer takes a PROJECT argument" ([init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)).

Below is a first-run transcript assembled from the source strings ([init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py), [init_util.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/init_util.py), [flow.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/credentials/flow.py), [login.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/auth/login.py)). The three network-diagnostic lines come from a module that was not fetched, so treat them as unverified:

```
Welcome! This command will take you through the configuration of gcloud.

Your current configuration has been set to: [default]

You can skip diagnostics next time by using the following flag:
  gcloud init --skip-diagnostics

Network diagnostic detects and fixes local network connection issues.
Checking network connection...done.
Reachability Check passed.

You must sign in to continue. Would you like to sign in (selecting "Y" will open your browser to the sign-in page where you complete authentication) (Y/n)?  Y

Your browser has been opened to visit:

    https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=…

You are now logged in as [student@example.com].
Your current project is [None].  You can change this setting by running:
  $ gcloud config set project PROJECT_ID

Pick cloud project to use:
 [1] my-project-1
 [2] Enter a project ID
 [3] Create a new project
Please enter numeric choice or text value (must exactly match list item):  1

Your current project has been set to: [my-project-1].

Do you want to configure a default Compute Region and Zone? (Y/n)?  Y

Which Google Compute Engine zone would you like to use as project default?
If you do not specify a zone via a command line flag while working with Compute Engine resources, the default is assumed.
 [1] Do not set default zone
 [2] us-east1-b
 …
Please enter numeric choice or text value (must exactly match list item):  2

Your project default Compute Engine zone has been set to [us-east1-b].
You can change it by running [gcloud config set compute/zone NAME].

Your project default Compute Engine region has been set to [us-east1].
You can change it by running [gcloud config set compute/region NAME].

The Google Cloud CLI is configured and ready to use!

* Commands that require authentication will use student@example.com by default
* Commands will reference project `my-project-1` by default
* Compute Engine commands will use region `us-east1` by default
* Compute Engine commands will use zone `us-east1-b` by default

Run `gcloud help config` to learn how to change individual settings

This gcloud configuration is called [default]. You can create additional configurations if you work with multiple accounts and/or projects.
Run `gcloud topic configurations` to learn more.

Some things to try next:

* Run `gcloud --help` to see the Cloud Platform services you can interact with. And run `gcloud help COMMAND` to get help on any gcloud command.
* Run `gcloud topic --help` to learn about advanced features of the CLI like arg files and output formatting
* Run `gcloud cheat-sheet` to see a roster of go-to `gcloud` commands.
```

**Cloud Shell changes three things.**

1. Credentials already exist, so `gcloud init` skips sign-in. It shows "Choose the account you want to use for this configuration." with the accounts plus `Sign in with a new Google Account` and `Skip this step`. A re-run on an existing configuration first prints `Settings from your current configuration [default] are:` and offers `Pick configuration to use:` ([init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)).
2. `gcloud auth login` first asks "You are already authenticated with gcloud when running inside the Cloud Shell and so do not need to run this command. Do you wish to proceed anyway?" ([login.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/auth/login.py)).
3. The no-browser flags lead to different flows ([flow.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/credentials/flow.py)):
   - `--no-launch-browser` (alias `--console-only`) prints `Go to the following link in your browser, and complete the sign-in prompts:`, then the URL, then `Once finished, enter the verification code provided in your browser: `.
   - `--no-browser` prints "You are authorizing gcloud CLI without access to a web browser. Please run the following command on a machine with a web browser and copy its output back here", followed by a `gcloud auth login --remote-bootstrap="…"` line and `Enter the output of the above command: `.

There is no `gcloud auth init`. That makes it a good distractor answer to test.

Successful commands also follow fixed shapes. gcloud announces resource changes as `Created [<self-link>].` and then prints the command's table format. For `compute instances create`, the table columns are NAME, ZONE, MACHINE_TYPE, PREEMPTIBLE, INTERNAL_IP, EXTERNAL_IP and STATUS ([instances flags.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/compute/instances/flags.py)). `gcloud auth list` uses `table[title='Credentialed Accounts'](status.yesno(yes='*', no=''):label=ACTIVE, account)` and ends with "To set the active account, run:" ([store.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/credentials/store.py)). `gcloud config list` ends with `Your active configuration is: [default]` ([config/list.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/config/list.py)). `compute networks create` prints a reminder that "Instances on this network will not be reachable until firewall rules are created", with sample commands ([networks/create.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/compute/networks/create.py)). Cloud Run shows a staged tracker before `Service URL:` ([messages_util.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/run/messages_util.py), [stages.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/run/stages.py)). GKE credentials print two lines ([get_credentials.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/container/clusters/get_credentials.py)). One conflict needs a decision. The 589 source for `services enable` prints `Operation "{0}" finished successfully.`, while the Service Usage docs show "Waiting for async operation operations/OPERATION_ID to complete..." ([enable.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/services/enable.py), [Service Usage docs](https://docs.cloud.google.com/service-usage/docs/enable-disable)). Prefer the source. The block below is reconstructed: the IDs are invented, the API host in the self-link is unverified, and a UTF-8 terminal may show ✓ in place of `OK`:

```
$ gcloud compute instances create web-1 --zone=us-central1-a --machine-type=e2-medium
Created [https://www.googleapis.com/compute/v1/projects/my-project-123/zones/us-central1-a/instances/web-1].
NAME   ZONE           MACHINE_TYPE  PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP  STATUS
web-1  us-central1-a  e2-medium                  10.128.0.2   34.27.10.11  RUNNING

$ gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=us-central1 --allow-unauthenticated
Deploying container to Cloud Run service [hello] in project [my-project-123] region [us-central1]
OK Deploying new service... Done.
  OK Creating Revision...
  OK Routing traffic...
  OK Setting IAM Policy...
Done.
Service [hello] revision [hello-00001-x7k] has been deployed and is serving 100 percent of traffic.
Service URL: https://hello-123456789012.us-central1.run.app

$ gcloud container clusters get-credentials my-cluster --location=us-central1
Fetching cluster endpoint and auth data.
kubeconfig entry generated for my-cluster.
```

The other tools have verified success lines too:

- kubectl (captured from v1.34.1): `deployment.apps/web created (dry run)`, `Switched to context "X".` and `Context "dev" created.`.
- Kubernetes docs: `deployment "nginx-deployment" successfully rolled out` ([Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)).
- bq: `Dataset 'babynames' successfully created.` and `Upload complete.`, then `Waiting on bqjob_… (1s) Current status: DONE` ([bq quickstart](https://docs.cloud.google.com/bigquery/docs/quickstarts/load-data-bq)).
- Terraform: `Terraform has been successfully initialized!`, `Plan: %d to add, %d to change, %d to destroy.` and `Apply complete! Resources: %d added, %d changed, %d destroyed.` ([views/init.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/init.go), [jsonformat/plan.go](https://github.com/hashicorp/terraform/blob/main/internal/command/jsonformat/plan.go), [views/apply.go](https://github.com/hashicorp/terraform/blob/main/internal/command/views/apply.go)).

A LoadBalancer Service should show `<pending>` under EXTERNAL-IP and then switch to an address after a delay ([expose tutorial](https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/)).

## Borrow n8n's tiles, Packet Tracer's feedback loops and ADC's auto-wiring

Each reference tool contributes a different layer. n8n contributes a compact, proven visual vocabulary. Packet Tracer contributes three feedback channels that make networks learnable. ADC and AWS Infrastructure Composer show that a connection should *do* something, namely write IAM bindings and environment variables, rather than just draw a line.

### n8n supplies the geometry and the state colours

n8n's canvas (v2, on Vue Flow) uses these geometry constants:

- **96×96 nodes on a 16 px grid**, with positions snapped by `Math.round(v/16)*16`.
- 128 px horizontal spacing between nodes.
- Node height grows with output count: `96 + max(0, handles − 2) × 32`.

Source: [nodeViewUtils.ts](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/app/utils/nodeViewUtils.ts).

The tile itself holds only the icon. The label sits outside, below the tile: medium weight, centred, clamped to two lines, with an optional one-line subtitle. Trigger nodes get a "D-shape" from a 36 px radius on their left corners, plus a bolt badge ([CanvasNodeDefault.vue](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/elements/nodes/render-types/CanvasNodeDefault.vue), [CanvasNodeTrigger.vue](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/elements/nodes/render-types/parts/CanvasNodeTrigger.vue)).

**State is shown by the border.** Each state has its own style ([_canvasNodeStyles.scss](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/elements/nodes/render-types/_canvasNodeStyles.scss)):

| State | Style |
|---|---|
| Default | 1.5 px border at 10% black |
| Selected | 6 px ring |
| Success | Green border |
| Error | Red border |
| Warning (parameters changed since the last run) | Amber border |
| Pinned | 2 px pinned border |
| Disabled | Grey border |
| Running | Coral `rgba(255,109,90)` conic gradient rotating every 1.5 s |
| Waiting | The same gradient, rotating every 4.5 s |

When several states apply, the later one in that table wins.

A bottom-right status glyph works through a priority chain. The order is restricted, then missing community node, disabled, execution errors (a tooltip titled "Issues:"), validation errors ("Setup required" when credentials are missing), pinned, dirty, and finally success with an iteration count ([CanvasNodeStatusIcons.vue](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/elements/nodes/render-types/parts/CanvasNodeStatusIcons.vue)).

Edges are bezier curves ([CanvasEdge.vue](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/elements/edges/CanvasEdge.vue)):

- Stroke width 2, scaled by a zoom-compensation factor so lines stay legible at any zoom.
- Green after a successful run.
- Arrow markers on main connections; non-main connections are dashed `5,6`.
- A 40 px invisible hit stroke for easy selection.

Hovering an edge shows a toolbar at the curve's midpoint with "+" (Add node) and trash (Delete connection). Hover-out is delayed so the pointer can reach the buttons. When a target sits more than 20 px left of its source, the edge loops 130 px below the source using smoothstep segments with 16 px corners ([getEdgeRenderData.ts](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/elements/edges/utils/getEdgeRenderData.ts)). That matters because learners often place a consumer to the left of its producer. Unconnected outputs draw a "+" handle ([CanvasHandleMainOutput.vue](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/components/elements/handles/render-types/CanvasHandleMainOutput.vue)).

The keyboard model to copy ([n8n shortcuts](https://docs.n8n.io/keyboard-shortcuts/)):

| Action | Keys |
|---|---|
| Open the nodes panel | **N** |
| Pan | Space+drag, middle-drag, Ctrl/Cmd+drag |
| Zoom | Ctrl/Cmd+wheel; `+`/`-`; `0` resets, `1` fits |
| Execute | **Ctrl/Cmd+Enter** |
| Undo / redo | Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z |
| Add a sticky note | Shift+S |
| Deactivate a node | D |
| Rename a node | F2 |
| Pin data | P |
| Open a node | Enter |

"Tidy up" runs dagre with `rankdir: 'LR'`, `nodesep = 96` and `ranksep = 128`, then snaps the result to the grid ([useCanvasLayout.ts](https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/workflows/canvas/composables/useCanvasLayout.ts)).

n8n's JSON keys connections by source node **name**: `connections[name].main[outputIndex] = [{node, type, index}]` ([interfaces.ts](https://github.com/n8n-io/n8n/blob/master/packages/workflow/src/interfaces.ts)). Use stable IDs internally and keep the name-keyed shape only for export. n8n's parameter vocabulary maps cleanly onto service forms ([Node UI elements](https://docs.n8n.io/integrations/creating-nodes/build/reference/ui-elements/)):

- `options` for region and machine-type dropdowns
- `boolean` for "Allow unauthenticated"
- `collection` behind an "Add option" button for advanced fields
- `fixedCollection` with `multipleValues` for env vars, labels and firewall rules
- `notice` for hints
- `displayOptions.show` for conditional fields

For a GCP lab, give D-shaped "trigger" tiles to the entry points: Cloud Scheduler, external load balancers, Eventarc triggers and Pub/Sub. Draw identity and network relationships dashed, the same way n8n draws non-main edges. Use the amber "dirty" border for "configuration changed since last deploy".

### Packet Tracer supplies link lights, equivalent commands and step-through simulation

Packet Tracer gives three kinds of feedback in the same place.

The first is link lights ([PT help: Connections](https://tutorials.ptnetacad.net/help/default/connectionsLinks.htm)):

- A bright green triangle means the physical link is up, which does not confirm the line protocol.
- Blinking green means activity.
- A red down triangle means the link is down.
- Round amber means an STP-blocked port.
- Round black means a console cable.

An "Automatically Choose Connection Type" tool picks the right cable. The lab's edge equivalents:

- **Green**: valid and fully wired.
- **Amber**: valid but pending. Google documents real delays here: IAM changes "can take several minutes" to propagate ([Pub/Sub push to Cloud Run](https://docs.cloud.google.com/run/docs/triggering/pubsub-push)), and Eventarc triggers can take "up to two minutes" to become functional ([Eventarc Cloud Storage trigger](https://docs.cloud.google.com/eventarc/docs/run/create-trigger-storage-gcloud)).
- **Red**: invalid pairing or a missing prerequisite.
- **Grey**: identity-only or management links.
- **Auto-wire**: an equivalent of the cable picker, which adds the needed grants itself.

The second is that config tabs show "Equivalent IOS Commands" as GUI fields change ([NetAcad: Configure End Devices](https://contenthub.netacad.com/legacy/I2PT/1.1/en/course/files/2.1.1.4%20Packet%20Tracer%20-%20Configure%20End%20Devices.pdf)). The Google Cloud console has the same idea: its "Equivalent code" option has Command line and REST tabs ([Compute Engine console](https://docs.cloud.google.com/compute/docs/console)). In the lab, every service form should render its live `gcloud …` line, generated by the same grammar the quiz grades.

The third is Simulation mode ([PT help: Simulation](https://tutorials.ptnetacad.net/help/default/mode_simulation.htm)):

- Controls: Play, Capture/Forward (one step), Back, Reset and a speed slider.
- An **Event List** with the columns Time, Last Device, At Device, Type and Info, where Info is broken down by OSI layer.
- Protocol filters that hide traffic without removing it.
- The simulation resets on any network or configuration change.

The lab's version is "Send test request". The event list would carry rows such as `Scheduler → Cloud Run · OIDC · IAM check: sa@… has roles/run.invoker ✓`, and a token animates along each edge path.

Packet Tracer also has an assessment model, the Activity Wizard ([PT help: Running activities](https://tutorials.ptnetacad.net/help/default/activityWizard_run.htm), [Assessment items](https://tutorials.ptnetacad.net/help/default/activityWizard_assessmentItems.htm), [Activity Wizard](https://tutorials.ptnetacad.net/help/default/activityWizard.htm)). The learner clicks Check Results and the network is compared against an author's **answer network**. Items are marked with a green check (complete), a white check (category partly complete) or a red X (missing or wrong). Dynamic percentage feedback re-assesses "every few seconds", but connectivity tests are excluded from that live score. The lab should follow the same split. Structural assertions can be scored live: node of type X exists, edge X→Y exists, `region == us-central1`, role present. Traffic tests should run only on demand.

### ADC and Infrastructure Composer make connections carry configuration

ADC's history:

| Date | Milestone |
|---|---|
| March 28, 2025 | Preview |
| October 7, 2025 | Generated Terraform becomes editable |
| December 5, 2025 | GA |
| April 22, 2026 | Composite templates and deployment-error troubleshooting |
| August 2026 | Security Command Center frameworks for validating designs |

Source: [ADC release notes](https://docs.cloud.google.com/application-design-center/docs/release-notes).

ADC templates are made of **components** (assets, services and workloads) joined by **connections**. A developer selects a template, customizes it, assesses it against security policies and deploys it, at which point the application draft becomes an application ([ADC overview](https://docs.cloud.google.com/application-design-center/docs/overview)). The Cloud Run component shows how much a connection does. It requires only Project ID, Region and Service Name before deploy. Everything else, including containers, environment variables, secrets, probes, VPC access, scaling and traffic, sits under "Show advanced fields". Each connection writes specific configuration ([ADC: Configure Cloud Run](https://docs.cloud.google.com/application-design-center/docs/configure-cloud-run)):

| Cloud Run connects to | ADC auto-configures |
|---|---|
| Secret Manager | `env_secret_vars` + `roles/secretmanager.secretAccessor` |
| Cloud SQL (MySQL/PostgreSQL) | Connection metadata + `roles/cloudsql.client` and `roles/cloudsql.instanceUser`; the service account is added as an instance IAM user |
| Pub/Sub | Topic ID in env vars + `roles/pubsub.publisher` and `roles/pubsub.subscriber`; the service is added to push or pull subscriptions |
| BigQuery | Dataset metadata in env vars + `roles/bigquery.dataEditor` |
| Cloud Storage | `roles/storage.objectAdmin` |
| Memorystore Redis / Redis Cluster / Valkey | `roles/redis.editor` / `roles/redis.dbConnectionUser` / `roles/memorystore.dbConnectionUser` |
| Another Cloud Run service | Destination URI in the source's env vars |
| Global or regional load balancer (backend) | Added to serverless NEG backends |
| Service account | Used as the identity; `roles/run.invoker`; email in env vars |

AWS Infrastructure Composer confirms the pattern from outside Google. You drag one card's port to another's, and Composer either connects the resources "or display[s] a message stating this configuration isn't supported". Connections are solid lines, and relationships detected from the template are dotted. A connection provisions IAM policies, environment variables and events "when necessary" ([Composer card connections](https://docs.aws.amazon.com/infrastructure-composer/latest/dg/using-composer-connecting.html)). The standalone Composer console ends support on December 7, 2026 ([What is Infrastructure Composer](https://docs.aws.amazon.com/infrastructure-composer/latest/dg/what-is-composer.html)).

The design these sources point to has three synchronized panes:

- **Canvas**: the diagram.
- **Config**: required fields first, "Show advanced fields" collapsed.
- **Code**: generated Terraform plus the equivalent gcloud.

The panes sit inside a lifecycle of Draft → **Assess** → Deploy → Application. Assess checks required fields, invalid edges and security lint such as "Cloud SQL has a public IP" or "allUsers invoker". Deploy shows n8n's running, success and error borders on each node. Each valid connection should show its auto-configuration diff, for example "+ env DB_HOST, + roles/cloudsql.client on sa-run@…". That diff makes visible the wiring that ADC hides, and making it visible is the main teaching value.

### The editor needs no canvas library

Everything n8n gets from Vue Flow can be rebuilt in plain SVG. React Flow's bezier formula, with `curvature = 0.25`, is `offset(d) = d ≥ 0 ? 0.5·d : c·25·√(−d)`. A right-side source puts its control point at `[sx + offset(tx − sx), sy]`, and a left-side target puts its control point at `[tx − offset(tx − sx), ty]`. The label or toolbar sits at the t = 0.5 point, `0.125·sx + 0.375·c1x + 0.375·c2x + 0.125·tx`, and likewise for y ([xyflow bezier-edge.ts](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/bezier-edge.ts)). The remaining pieces are standard engineering, not taken from these sources:

- One world transform, `<g transform="translate(px,py) scale(z)">`.
- Pointer events with `setPointerCapture`, dispatched to pan, marquee, node-drag or connect modes.
- A connect tolerance of about 20 px, matching n8n's handle size.
- Pointer-based palette drag, plus click-to-add at +224 px (96 + 128) to the right of the selected node.
- Undo snapshots taken on committed actions only.
- `localStorage` wrapped in try/catch, with dangling edges dropped on load.
- Focusable nodes, plus a keyboard "connect" mode that cycles through *valid* targets and announces results through `aria-live`.

A minimal internal model looks like this:

```ts
type EdgeKind = 'data' | 'invoke' | 'identity' | 'network';
type SvcNode = { id: string; type: string; name: string; position: [number, number];
  params: Record<string, unknown>; status?: 'idle'|'running'|'success'|'error'|'warning'; issues?: string[] };
type Edge = { id: string; from: { node: string; port: string }; to: { node: string; port: string };
  kind: EdgeKind; derived?: { env: Record<string, string>; iam: string[] } }; // filled by the rule table
```

## Encode each service form as validators carrying Google's real limits

The config panel teaches as much as the edges do, because many ACE questions turn on a single limit or default. Every field below has a documented allowed value set, default or immutability rule. The tables group the rules that should block a deploy (red issue badge) separately from the defaults the form should pre-fill. Where gcloud and the Console differ, both are listed: the quiz may ask about either.

**Compute and networking**

| Service | Reject when | Defaults and one-way settings |
|---|---|---|
| Compute Engine VM | The name fails RFC 1035 `^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$`. The API error reads `Invalid value for field 'resource.name': '…'. Must be a match of regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)'` ([naming](https://docs.cloud.google.com/compute/docs/naming-resources), [Bugzilla](https://bugzilla.redhat.com/show_bug.cgi?id=1330982)). The zone does not exist: us-central1 has a/b/c/**f**, while us-east1 and europe-west1 have only b/c/d, so `us-east1-a` is a trap ([regions](https://docs.cloud.google.com/compute/docs/regions-zones)). Custom memory is not a multiple of 256 MB ([custom types](https://docs.cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type)). A pd-* disk is attached to N4 or C4D, which support Hyperdisk only ([general-purpose](https://docs.cloud.google.com/compute/docs/general-purpose-machines)). More than 64 network tags ([tags](https://docs.cloud.google.com/vpc/docs/add-remove-network-tags)) or labels ([labels](https://docs.cloud.google.com/compute/docs/labeling-resources)) | Boot disk: **pd-balanced in the Console, pd-standard via gcloud/API** ([Persistent Disk](https://docs.cloud.google.com/compute/docs/disks/persistent-disks)). The default Compute SA is attached with six default scopes, and Google recommends `cloud-platform` plus IAM ([compute SA](https://docs.cloud.google.com/compute/docs/access/service-accounts)). Spot: termination action STOP by default (or DELETE), and it cannot restart automatically ([Spot](https://docs.cloud.google.com/compute/docs/instances/create-use-spot), [host options](https://docs.cloud.google.com/compute/docs/instances/setting-vm-host-options)) |
| Managed instance group | A regional MIG with a fixed maxSurge/maxUnavailable that is neither 0 nor ≥ its zone count. RECREATE with maxSurge > 0. A most-disruptive action that is less disruptive than the minimal action ([rolling updates](https://docs.cloud.google.com/compute/docs/instance-groups/rolling-out-updates-to-managed-instance-groups)). An autohealing initial delay outside 0–3600 s ([autohealing](https://docs.cloud.google.com/compute/docs/instance-groups/autohealing-instances-in-migs)) | maxSurge and maxUnavailable default to 1 for zonal MIGs and to the zone count (3) for regional ones. Autoscaler initialization period 60 s, stabilization 600 s. The CPU target is a fraction in gcloud (`0.6`) but a percentage in the Console ([CPU autoscaling](https://docs.cloud.google.com/compute/docs/autoscaler/scaling-cpu)). Initial delay is 300 s in the Console but 0 in gcloud |
| GKE | The name is over 40 characters, starts with a non-letter, or ends with a hyphen ([clusters create](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/create)). An Autopilot cluster is zonal or has no release channel. `--master-ipv4-cidr` is not /28. The workload pool is not `PROJECT_ID.svc.id.goog` | Standard defaults: 3 nodes, e2-medium, 100 GB pd-balanced. **Min and max nodes are per zone**, so 3 nodes in a regional cluster means 9. The Regular channel is the default, and "No channel" is deprecated ([release channels](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/release-channels)). Autopilot comes with Workload Identity preconfigured ([comparison](https://docs.cloud.google.com/kubernetes-engine/docs/resources/autopilot-standard-feature-comparison)) |
| Cloud Run service | The name is 50 characters or more, starts with a non-letter, or ends with a hyphen ([deploying](https://docs.cloud.google.com/run/docs/deploying)). CPU and memory are mispaired: 0.08 vCPU allows up to 512 MiB, 0.5 up to 1 GiB, 1 up to 4 GiB, 2 up to 8 GiB, 4 allows 2–16 GiB, 6 allows 4–24 GiB and 8 allows 4–32 GiB ([memory](https://docs.cloud.google.com/run/docs/configuring/services/memory-limits)). Below 1 vCPU, concurrency is not 1, billing is not request-based, or the environment is not gen1 ([CPU](https://docs.cloud.google.com/run/docs/configuring/services/cpu)). Timeout over 3600 s. Direct VPC subnet smaller than /26 or in another region ([Direct VPC](https://docs.cloud.google.com/run/docs/configuring/vpc-direct-vpc)). One real error to copy: "Invalid value specified for memory with cpu unthrottled. For 1.0 CPU, memory must be between 512Mi and 4Gi inclusive." ([zenn.dev](https://zenn.dev/uma002/articles/94d100b44230d8)) | 1 vCPU, 512 MiB, concurrency 80 (max 1000) ([concurrency](https://docs.cloud.google.com/run/docs/configuring/concurrency)). Timeout 300 s ([timeout](https://docs.cloud.google.com/run/docs/configuring/request-timeout)). Max 100 instances ([max instances](https://docs.cloud.google.com/run/docs/configuring/max-instances)). Request-based billing ([billing](https://docs.cloud.google.com/run/docs/configuring/billing-settings)). Ingress `all` ([ingress](https://docs.cloud.google.com/run/docs/securing/ingress)). `--vpc-egress private-ranges-only`. The name cannot be changed later |
| Cloud Run functions | `--runtime` is missing on a new function. Timeout over 3600 s for HTTP functions or over 540 s for event-driven ones. More than 16 GiB or 4 vCPU ([comparison](https://docs.cloud.google.com/run/docs/functions/comparison)). A storage trigger whose location differs from the bucket's region, dual-region or multi-region ([storage triggers](https://docs.cloud.google.com/functions/docs/calling/storage)) | 256 MB, 60 s, min instances 0, gen2 ([functions deploy](https://docs.cloud.google.com/sdk/gcloud/reference/functions/deploy)). Runtime IDs include nodejs24, python313, go126, java21 and dotnet8. nodejs20 will be decommissioned on 2026-10-30 ([runtimes](https://docs.cloud.google.com/run/docs/runtimes/function-runtimes)) |
| App Engine | An F class with basic or manual scaling, or a B class with automatic scaling ([standard](https://docs.cloud.google.com/appengine/docs/standard)) | Defaults: F1 for automatic scaling, B2 for basic/manual. "You cannot change an app's region after you set it." App Engine uses `us-central` and `europe-west` for the regions called `us-central1` and `europe-west1` elsewhere ([locations](https://docs.cloud.google.com/appengine/docs/standard/locations)) |
| VPC and subnets | A subnet smaller than /29. Prohibited ranges such as 0.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16 and 224.0.0.0/4. Overlap within the VPC or with a peered VPC. Shrinking or replacing a primary range. IPv6 on an auto-mode VPC ([subnets](https://docs.cloud.google.com/vpc/docs/subnets)). MTU outside 1300–8896 ([MTU](https://docs.cloud.google.com/vpc/docs/mtu)) | Auto mode gives one /20 per region inside 10.128.0.0/9. **Auto-to-custom conversion is one-way** ([VPC](https://docs.cloud.google.com/vpc/docs/vpc)). MTU 1460. Routing mode REGIONAL. Usable hosts = 2^(32−prefix) − 4 |
| Firewall rules | Priority outside 0–65535. Ports on a protocol other than tcp/udp. Target service accounts mixed with target tags ([firewalls](https://docs.cloud.google.com/vpc/docs/firewalls)) | Priority 1000. Implied allow-egress and deny-ingress. The default network's four rules sit at priority **65534**. At equal priority, deny beats allow. Egress to TCP 25 is blocked. Sources default to 0.0.0.0/0 ([firewall-rules create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/firewall-rules/create)) |
| Cloud Router and NAT | An ASN outside 64512–65534 and 4200000000–4294967294 (16550 is allowed for Partner Interconnect) ([Cloud Router](https://docs.cloud.google.com/network-connectivity/docs/router/how-to/create-router-vpc-network)) | NAT minimum ports per VM: 64 static or 32 dynamic. 64,512 ports per IP ([NAT ports](https://docs.cloud.google.com/nat/docs/ports-and-addresses)) |
| VPC peering | Overlapping ranges. Two auto-mode networks. Expecting transitive routing ([peering](https://docs.cloud.google.com/vpc/docs/vpc-peering)) | Firewall rules, tags and internal DNS are not shared across a peering |
| Load balancers | A health check attached to a serverless NEG. A regional Envoy-based LB without a proxy-only subnet ([choosing an LB](https://docs.cloud.google.com/load-balancing/docs/choosing-load-balancer), [LB firewall rules](https://docs.cloud.google.com/load-balancing/docs/firewall-rules)) | Health checks: interval 5 s, timeout 5 s, healthy and unhealthy thresholds 2 ([health checks](https://docs.cloud.google.com/load-balancing/docs/health-check-concepts)). Schemes: EXTERNAL_MANAGED (global and regional external ALB), EXTERNAL (classic), INTERNAL_MANAGED (internal) |

**Data, messaging, security and operations**

| Service | Reject when | Defaults and one-way settings |
|---|---|---|
| Cloud Storage bucket | The name is outside 3–63 characters (222 if dotted, at most 63 per dot-separated part), uses characters other than lowercase letters, digits, `-`, `_` and `.`, starts or ends with a non-alphanumeric character, is an IP address, starts with `goog`, or contains "google" or look-alikes. Soft delete is neither 0 nor 7–90 days. Retention is over 100 years. Hierarchical namespace is enabled without uniform access. Autoclass is combined with `SetStorageClass` lifecycle rules ([buckets](https://docs.cloud.google.com/storage/docs/buckets), [soft delete](https://docs.cloud.google.com/storage/docs/soft-delete), [autoclass](https://docs.cloud.google.com/storage/docs/autoclass), [buckets create](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create)) | Location `us`, class STANDARD, soft delete 7 days. Minimum storage durations are Nearline 30, Coldline 90 and Archive 365 days ([storage classes](https://docs.cloud.google.com/storage/docs/storage-classes)). **Uniform access "cannot be disabled after it has been active on a bucket for 90 consecutive days"** ([UBLA](https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access)). A locked retention policy can only grow ([bucket lock](https://docs.cloud.google.com/storage/docs/bucket-lock)). Lifecycle rules only move objects to colder classes ([lifecycle](https://docs.cloud.google.com/storage/docs/lifecycle)) |
| Cloud SQL | The ID uses characters other than lowercase letters, digits and hyphens, does not start with a letter, or makes `project:instance` longer than 98 characters. A custom tier has a vCPU count other than 1 or an even number up to 96, memory outside 0.9–6.5 GB per vCPU, memory not in 256 MB steps, or less than 3.75 GB. A custom tier is used on Enterprise Plus. Only one of `--cpu` and `--memory` is given ("Both --cpu and --memory must be specified if a custom machine type is desired.") ([MySQL settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [sql instances create](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create)). Private IP without private services access ([private IP config](https://docs.cloud.google.com/sql/docs/mysql/configure-private-ip)) | **Fixed at create: ID, region, database version, storage type and encryption.** Private IP cannot be turned off once enabled, and storage only grows. Default database version: `MYSQL_8_0` in gcloud but `MYSQL_8_4` in the docs (the sources disagree). Other defaults: zonal availability, SSD, 10 GB, backups on, `ALLOW_UNENCRYPTED_AND_ENCRYPTED`. Private Service Connect is now the Console's default private-IP option for new projects ([private IP](https://docs.cloud.google.com/sql/docs/mysql/private-ip)) |
| Pub/Sub | The ID is outside 3–255 characters, does not start with a letter, or starts with `goog` ([basics](https://docs.cloud.google.com/pubsub/docs/pubsub-basics)). Ack deadline outside 10–600 s. Retention outside 10 minutes–31 days. Expiration shorter than retention or than 1 day. Retry delays outside 0–600 s. Dead-letter attempts outside 5–100, or a dead-letter topic equal to the source topic ([subscription properties](https://docs.cloud.google.com/pubsub/docs/subscription-properties), [subscriptions create](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create)) | Pull delivery, ack 10 s, retention 7 days (the old 7-day *maximum* is outdated), expiration 31 days, 5 delivery attempts. **The filter is immutable.** `--push-endpoint` makes the subscription a push subscription |
| BigQuery | A dataset ID containing hyphens or other characters outside letters, digits and underscores, or longer than 1,024 characters. Time travel outside 48–168 h or not a multiple of 24. Default table expiration under 3600 s ([datasets](https://docs.cloud.google.com/bigquery/docs/datasets)). More than four clustering columns ([clustered tables](https://docs.cloud.google.com/bigquery/docs/clustered-tables)). A job location that does not match the dataset ([BigQuery locations](https://docs.cloud.google.com/bigquery/docs/locations)) | **The location is fixed.** Time travel 168 h, LOGICAL storage billing. Partition by a DATE/TIMESTAMP/DATETIME column, ingestion time or an integer range ([partitioned tables](https://docs.cloud.google.com/bigquery/docs/partitioned-tables)) |
| Memorystore for Redis | Read replicas on Basic tier or on an instance under 5 GB. An alternative zone equal to the zone ([redis instances create](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create)) | 1 GiB (max 300 GB), DIRECT_PEERING, a /29 range (/28 with replicas), AUTH and TLS off, port 6379. **Tier and connect mode are immutable**, and Shared VPC requires PRIVATE_SERVICE_ACCESS ([tiers](https://docs.cloud.google.com/memorystore/docs/redis/redis-tiers), [networking](https://docs.cloud.google.com/memorystore/docs/redis/networking)) |
| Firestore | The database ID is outside 4–63 characters, uses characters other than lowercase letters, digits and hyphens, or looks like a UUID. More than 100 databases ([manage databases](https://docs.cloud.google.com/firestore/native/docs/manage-databases)) | `(default)` ID, delete protection off. Mode is native or datastore. The location (a region, or nam5/nam7/eur3) cannot change ([locations](https://docs.cloud.google.com/firestore/native/docs/locations)) |
| Secret Manager | The ID uses characters other than letters, digits, `-` and `_`, or exceeds 255 characters. The value exceeds 64 KiB ([create secrets](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets)). A Cloud Run mount at `/dev`, `/proc` or `/sys` ([Cloud Run secrets](https://docs.cloud.google.com/run/docs/configuring/services/secrets)) | Automatic replication. User-managed replication locations "can't be updated" ([replication](https://docs.cloud.google.com/secret-manager/docs/choosing-replication)). Env-var secrets "are resolved at instance startup time", while volume mounts always fetch the latest version |
| Artifact Registry | `--repository-format` is missing. Valid formats are DOCKER, MAVEN, NPM, APT, YUM, GOOGET, PYTHON, KFP, GO, GENERIC and RUBY ([REST](https://docs.cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations.repositories)) | Format, mode, location and encryption are fixed at create. Immutable tags are off by default ([create repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos)) |
| Cloud Scheduler | The job ID exceeds 500 characters. The cron expression does not have exactly 5 fields. The method is not one of delete, get, head, post or put. OIDC and OAuth are both set, or the service account is in another project. Attempt deadline outside 15 s–30 min. Retries outside 0–5 ([gcloud http job](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http), [REST](https://docs.cloud.google.com/scheduler/docs/reference/rest/v1/projects.locations.jobs)) | UTC, POST, 3-minute deadline, 0 retries ([cron](https://docs.cloud.google.com/scheduler/docs/configuring/cron-job-schedules)) |
| Eventarc | A Cloud Storage trigger in a different project or location from the bucket ([Eventarc storage](https://docs.cloud.google.com/eventarc/standard/docs/run/create-trigger-storage-gcloud)) | Event types are `google.cloud.storage.object.v1.{finalized,deleted,archived,metadataUpdated}` and `google.cloud.pubsub.topic.v1.messagePublished` ([supported events](https://docs.cloud.google.com/eventarc/docs/reference/supported-events)) |
| Service account | The account ID is outside 6–30 characters or does not match `[a-z]([-a-z0-9]*[a-z0-9])` ([IAM REST](https://docs.cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/create)) | The name cannot be changed. Allow 60 s or more for propagation ([create SAs](https://docs.cloud.google.com/iam/docs/service-accounts-create)). Key creation is disabled by default in orgs created on or after May 3, 2024 ([SA best practices](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts)) |
| Logging sink | The destination is not one of `storage.googleapis.com/BUCKET`, `bigquery.googleapis.com/projects/P/datasets/D`, `pubsub.googleapis.com/projects/P/topics/T` or `logging.googleapis.com/…`. Any edit to `_Required` ([export](https://docs.cloud.google.com/logging/docs/export/configure_export_v2), [routing](https://docs.cloud.google.com/logging/docs/routing/overview)) | `_Required` keeps logs 400 days, not configurable. `_Default` keeps 30 days, configurable 1–3650. Limits: 200 sinks per project, 50 exclusions per sink, filters up to 20,000 characters ([logging quotas](https://docs.cloud.google.com/logging/quotas)). Sinks do not export entries written before they were created |

Several rules involve more than one field, and these make the best "why is this red?" exercises:

- Choosing Spot forces TERMINATE on host maintenance and turns automatic restart off.
- Choosing Autopilot hides the node fields and forces a region.
- Setting CPU below 1 locks concurrency to 1.
- Enabling a dead-letter topic unlocks the 5–100 delivery-attempts field.
- Enabling hierarchical namespace requires uniform access.

A few documents contradict themselves, and the simulator should pick one value deliberately:

- The custom-machine page caps N2 at 80 vCPU in its table but allows 128 in its sample code ([custom types](https://docs.cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type)).
- The Cloud Run CPU page gives fractional increments of both 0.01 and 0.001 ([CPU](https://docs.cloud.google.com/run/docs/configuring/services/cpu)).
- Memorystore's REST reference defaults to Redis 7.0 while the Console recommends 7.2 ([REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances)).

## Every edge must pass five checks: mechanism, identity, API, network, location

A connection on the canvas is valid only if all five checks pass:

1. **Mechanism.** A real mechanism exists for the pair, such as a push subscription, a serverless NEG or an Eventarc trigger.
2. **Identity.** A specific calling identity holds a specific role on a specific resource.
3. **APIs.** The required APIs are enabled.
4. **Network.** A network path exists.
5. **Location.** The locations are compatible.

The calling identity is rarely the learner. Depending on the edge, it is the runtime service account, a push-auth service account, a trigger service account, a sink writer identity or a Google-managed service agent. Model new projects as post-2024: Cloud Build now runs as the Compute Engine default SA, and Compute Engine default SAs created on or after May 3, 2024 no longer receive Editor ([Cloud Build SA change](https://docs.cloud.google.com/build/docs/cloud-build-service-account-updates)). Without that assumption the IAM half of each edge teaches nothing. The matrix below condenses the mechanisms, roles and documented failures.

| Edge | Mechanism and caller | Required role @ resource | Network or location rule | What the learner should see when it breaks |
|---|---|---|---|---|
| Internet → Cloud Run | Direct HTTPS to `run.app`, anonymous | Invoker IAM check disabled (`--no-invoker-iam-check`, now recommended) or `allUsers` → `roles/run.invoker` ([public access](https://docs.cloud.google.com/run/docs/authenticating/public)) | Ingress `all` | "HTTP 403: Forbidden: Your client does not have permission to get URL from this server." Ingress internal gives "HTTP 404: Not found" ([troubleshooting](https://docs.cloud.google.com/run/docs/troubleshooting)). Under Domain Restricted Sharing, adding `allUsers` fails with "One or more users named in the policy do not belong to a permitted customer." ([DRS](https://docs.cloud.google.com/resource-manager/docs/organization-policy/restricting-domains)) |
| Service or VM → private Cloud Run | ID token with aud = service URL, sent as the caller's SA | `roles/run.invoker` on the target | Internal ingress needs a VPC path; a custom domain cannot be the `aud` ([service-to-service](https://docs.cloud.google.com/run/docs/authenticating/service-to-service)) | "HTTP 403: The request was not authenticated…"; "HTTP 401: The request was not authorized to invoke this service" for a wrong token or audience |
| External ALB → serverless NEG → Cloud Run | Serverless NEG | Same IAM as above. With IAP, users need `roles/iap.httpsResourceAccessor` and the IAP agent needs `run.invoker` ([IAP for Cloud Run](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run)) | Application LBs only (never Network LBs). The NEG is in the service's region with exactly one endpoint and no health check. Ingress `internal-and-cloud-load-balancing` or `all` ([serverless NEG](https://docs.cloud.google.com/load-balancing/docs/negs/serverless-neg-concepts)) | A Network LB type is rejected, as is a region mismatch. A private service with no IAP still returns 403 |
| External ALB → MIG | Instance-group backend plus health check | None | Ingress allow from `35.191.0.0/16` (plus `2600:2d00:1:b029::/64`), and from `130.211.0.0/22` for global and classic ALBs per the firewall page | Backends UNHEALTHY. Classic ALB returns **502**; global and regional ALBs return **503** ([health checks](https://docs.cloud.google.com/load-balancing/docs/health-check-concepts)) |
| External ALB → backend bucket | Backend bucket | `allUsers` or `service-PROJECT_NUM@https-lb.iam.gserviceaccount.com` → `roles/storage.objectViewer` | Global external or classic ALB only; no IAP. IAP and CDN cannot share a backend service ([backend buckets](https://docs.cloud.google.com/load-balancing/docs/https/ext-load-balancer-backend-buckets)) | A regional LB or IAP is rejected at design time |
| Pub/Sub → Cloud Run (push) | Push subscription with OIDC, sent as the push-auth SA | `roles/run.invoker` on the service. For projects created on or before 2021-04-08, the Pub/Sub agent also needs `roles/iam.serviceAccountTokenCreator` ([push to Cloud Run](https://docs.cloud.google.com/run/docs/triggering/pubsub-push)) | Publicly addressable endpoint. Internal ingress is fine from the same project via `run.app` | Push 403s, non-2xx `push_request_count`, a growing backlog. Only 102/200/201/202/204 count as acks ([push](https://docs.cloud.google.com/pubsub/docs/push)) |
| Pub/Sub or Cloud Storage → Cloud Run (Eventarc) | Trigger, sent as the trigger SA | `roles/eventarc.eventReceiver`, plus `run.invoker` if the target is private. For storage triggers, the GCS agent needs `roles/pubsub.publisher` ([Eventarc storage](https://docs.cloud.google.com/eventarc/docs/run/create-trigger-storage-gcloud), [Pub/Sub triggers](https://docs.cloud.google.com/run/docs/triggering/pubsub-triggers)) | Same project. The trigger location matches the bucket. Up to 2 minutes to become active | "Permission denied while using the Eventarc Service Agent". Trigger condition `NOT_FOUND`: "Pub/Sub topic not found. Try recreating the trigger." ([Eventarc troubleshooting](https://docs.cloud.google.com/eventarc/docs/troubleshooting)) |
| Pub/Sub → BigQuery | BigQuery subscription, sent as the Pub/Sub service agent (or a custom SA) | `roles/bigquery.dataEditor` on the table or project ([BQ subscription](https://docs.cloud.google.com/pubsub/docs/create-bigquery-subscription)) | The table exists and has a `data` column, or a schema option is chosen | Messages are not written or are dead-lettered, with the reason in `CloudPubSubDeadLetterSourceDeliveryErrorMessage` ([BigQuery subscriptions](https://docs.cloud.google.com/pubsub/docs/bigquery)) |
| Pub/Sub → Cloud Storage | Cloud Storage subscription, sent as the Pub/Sub agent | `roles/storage.objectCreator` + `roles/storage.legacyBucketReader` | The bucket exists and Requester Pays is off | "Unable to verify if the Pub/Sub service agent has write permissions on this bucket." ([GCS subscription](https://docs.cloud.google.com/pubsub/docs/create-cloudstorage-subscription)) |
| Cloud Storage → Pub/Sub | Bucket notification, sent as `service-PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com` | `roles/pubsub.publisher` on the topic ([notifications](https://docs.cloud.google.com/storage/docs/reporting-changes)) | None | No notifications are published |
| Scheduler / Tasks / Workflows → Cloud Run | OIDC token from an SA in the same project | `roles/run.invoker` on the service. The job creator needs `roles/iam.serviceAccountUser` on the SA ([Scheduler auth](https://docs.cloud.google.com/scheduler/docs/http-target-auth), [Tasks](https://docs.cloud.google.com/tasks/docs/creating-http-target-tasks), [Workflows](https://docs.cloud.google.com/workflows/docs/calling-run-functions)) | `run.app` URL if ingress is internal. Cloud Run *jobs* do not serve HTTP | An OAuth token sent to `run.app` gets 401. A missing invoker role gets 403. A Workflows call with no `auth:` block sends no identity |
| Cloud Run → Cloud SQL (public IP) | Built-in socket at `/cloudsql/project:region:instance`, sent as the runtime SA | `roles/cloudsql.client`, plus the Cloud SQL Admin API enabled ([connect from Cloud Run](https://docs.cloud.google.com/sql/docs/mysql/connect-run)) | None | "Error 403: Access Not Configured" when the API is off. 403 notAuthorized when the role is missing ([Auth Proxy](https://docs.cloud.google.com/sql/docs/mysql/connect-auth-proxy)) |
| Cloud Run → Cloud SQL private IP, Memorystore, or a VM's internal IP | Direct VPC egress (recommended) or a connector | DB credentials, or AUTH for Redis | Subnet in the service's region, /26 or larger, on the instance's VPC or `authorizedNetwork`. No legacy networks. The destination firewall allows the egress range ([VPC options](https://docs.cloud.google.com/run/docs/configuring/connecting-vpc), [Redis from Cloud Run](https://docs.cloud.google.com/memorystore/docs/redis/connect-redis-instance-cloud-run)) | "dial tcp REMOTE_HOST:REMOTE_PORT: i/o timeout" ([troubleshooting](https://docs.cloud.google.com/run/docs/troubleshooting)) |
| GKE → Cloud SQL | Auth Proxy sidecar, sent as a Workload Identity GSA | `roles/cloudsql.client` | For private IP, a VPC-native cluster in the same VPC ([connect from GKE](https://docs.cloud.google.com/sql/docs/mysql/connect-kubernetes-engine)) | Proxy 403 |
| Compute → Google APIs | Runtime SA | `roles/datastore.user`. For BigQuery queries, `roles/bigquery.jobUser` (project) **plus** `roles/bigquery.dataEditor` (dataset). `roles/storage.objectCreator` or `objectAdmin`. `roles/secretmanager.secretAccessor` ([BigQuery IAM](https://docs.cloud.google.com/bigquery/docs/access-control), [Firestore IAM](https://docs.cloud.google.com/firestore/native/docs/security/iam)) | A VM with only an internal IP needs Private Google Access on its subnet ([PGA](https://docs.cloud.google.com/vpc/docs/private-google-access)) | "User does not have bigquery.jobs.create permission in project …" ([forum](https://discuss.google.dev/t/access-denied-project-user-does-not-have-bigquery-jobs-create-permission-in-project-error/112756)). A missing secret role gives "HTTP 500 … The request failed because the instance could not start successfully." |
| Cloud Build → Artifact Registry → Cloud Run | Build SA | `roles/artifactregistry.writer`, `roles/run.admin`, and `roles/iam.serviceAccountUser` on the runtime SA ([deploy with Cloud Build](https://docs.cloud.google.com/build/docs/deploying-builds/deploy-cloud-run)) | None | "Permission 'iam.serviceAccounts.actAs' denied on service account" |
| Artifact Registry (other project) → Cloud Run or GKE | Pull as the Cloud Run agent `…@serverless-robot-prod.iam.gserviceaccount.com`, or as the GKE node SA | `roles/artifactregistry.reader` on the repo ([other projects](https://docs.cloud.google.com/run/docs/deploying#other-projects), [AR with GKE](https://docs.cloud.google.com/artifact-registry/docs/integrate-gke)) | Scopes on existing nodes cannot be changed | "Google Cloud Run Service Agent must have permission to read the image"; ImagePullBackOff on GKE |
| Logging sink → BigQuery / GCS / Pub/Sub / log bucket | Writer identity | `bigquery.dataEditor`, `storage.objectCreator`, `pubsub.publisher` or `logging.bucketWriter` respectively ([sinks](https://docs.cloud.google.com/logging/docs/export/configure_export_v2)) | No regional `rep.googleapis.com` endpoints. No in-transit-restricted topics | Email "[ACTION REQUIRED] Cloud Logging sink configuration error in [PROJECT_ID]", and `sink_error` logs such as `topic_not_found` ([sink troubleshooting](https://docs.cloud.google.com/logging/docs/export/troubleshoot)) |

The health-check range row reflects a real disagreement. The current health-check concepts page lists only `35.191.0.0/16` as the probe source. The LB firewall-rules page still requires `130.211.0.0/22` as a GFE proxy range for global and classic ALBs, and the autohealing page still names both ranges ([LB firewall rules](https://docs.cloud.google.com/load-balancing/docs/firewall-rules), [autohealing](https://docs.cloud.google.com/compute/docs/instance-groups/autohealing-instances-in-migs)). Exam answers expect both. The lab should therefore require both for global and classic ALBs, and require `35.191.0.0/16` everywhere else.

Service agents deserve their own grey identity tiles, because several edges fail on them and not on any user-visible account:

| Agent | Email | Must hold |
|---|---|---|
| Pub/Sub | `service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com` | Publisher on the DLQ topic and subscriber on the source subscription ([handling failures](https://docs.cloud.google.com/pubsub/docs/handling-failures)); Data Editor for BigQuery subscriptions |
| Cloud Storage | `service-PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com` | `roles/pubsub.publisher` for notifications and Eventarc |
| Eventarc | `service-PROJECT_NUMBER@gcp-sa-eventarc.iam.gserviceaccount.com` | `roles/eventarc.serviceAgent` |
| Cloud Scheduler | `service-PROJECT_NUMBER@gcp-sa-cloudscheduler.iam.gserviceaccount.com` | `roles/cloudscheduler.serviceAgent`. "Without this role, Cloud Scheduler jobs fail", and revoking it gives 403s ([Scheduler auth](https://docs.cloud.google.com/scheduler/docs/http-target-auth)) |
| IAP | `service-PROJECT_NUMBER@gcp-sa-iap.iam.gserviceaccount.com` | `roles/run.invoker` on IAP-protected services |
| LB backend buckets | `service-PROJECT_NUM@https-lb.iam.gserviceaccount.com` | `roles/storage.objectViewer` on private buckets |
| Cloud Run | `…@serverless-robot-prod.iam.gserviceaccount.com` | `roles/artifactregistry.reader` on cross-project repositories |
| Logging | `service-PROJECT_NUMBER@gcp-sa-logging.iam.gserviceaccount.com` (writer identity) | The destination role |
| Monitoring notifications | `service-PROJECT_NUMBER@gcp-sa-monitoring-notification.iam.gserviceaccount.com` | `roles/pubsub.publisher` on Pub/Sub channels ([notification options](https://docs.cloud.google.com/monitoring/support/notification-options)) |
| Dataflow | `service-PROJECT_NUMBER@dataflow-service-producer-prod.iam.gserviceaccount.com` | `roles/dataflow.serviceAgent`; workers need `roles/dataflow.worker` ([Dataflow permissions](https://docs.cloud.google.com/dataflow/docs/concepts/security-and-permissions)) |

**Some invalid edges should be rejected on drop, the way Composer says "not supported".** In each case either no mechanism exists for the pair or Google documents a restriction:

- Cloud Storage → Cloud SQL directly. Storage only emits notifications and events, so a compute hop is required.
- Pub/Sub → Cloud SQL, Firestore or Memorystore. Subscriptions come only as pull, push, BigQuery and Cloud Storage.
- Pub/Sub push → any private IP. Push needs a publicly addressable endpoint.
- Any load balancer → Cloud SQL, Memorystore or BigQuery. Serverless NEGs accept only Cloud Run, functions, App Engine and API Gateway; backend buckets accept only Cloud Storage.
- Proxy or passthrough Network LBs → a serverless NEG.
- A serverless NEG in another region from its service, with a health check, or mixed with other NEG types.
- A regional ALB → a backend bucket. IAP on a backend bucket. IAP together with Cloud CDN. IAP on both the LB and the Cloud Run service.
- An Eventarc storage trigger in a different location or project from its bucket.
- A Direct VPC subnet in another region from its service.
- A Scheduler or Tasks identity from another project, or the Scheduler service agent used as the token identity.
- Internal-ingress Cloud Run reached through a custom domain.
- Any HTTP caller → a Cloud Run *job*.
- A browser → a private Cloud Run service with no ID token.

Sources: [serverless NEG](https://docs.cloud.google.com/load-balancing/docs/negs/serverless-neg-concepts), [ingress](https://docs.cloud.google.com/run/docs/securing/ingress), [Workflows](https://docs.cloud.google.com/workflows/docs/calling-run-functions).

Each rule entry should carry the fix as well as the verdict. Then a red edge can show the real error and the exact command that repairs it, and that command can be offered as a quiz item:

```ts
rules['pubsub_topic->cloud_run'] = {
  mechanism: 'push-subscription', kind: 'invoke',
  identity: 'pushAuthServiceAccount',
  requires: [{ role: 'roles/run.invoker', on: 'target' },
             { role: 'roles/iam.serviceAccountTokenCreator', on: 'project',
               principal: 'pubsubServiceAgent', when: 'project.createdBefore("2021-04-09")' }],
  apis: ['pubsub', 'run'], network: 'public-endpoint',
  failure: 'push 403s; non-2xx push_request_count; backlog grows',
  fix: 'gcloud run services add-iam-policy-binding SERVICE --member=serviceAccount:SA --role=roles/run.invoker',
  adcEquivalent: { env: ['TOPIC_ID'], iam: ['roles/pubsub.publisher', 'roles/pubsub.subscriber'] },
};
```

## Conclusion

Authenticity comes from a small number of strings and numbers: a modest set of format strings, a few exit codes (gcloud's 2 for parse errors and 1 for runtime errors, Docker's 125 for flag errors), and a version pin. Most of the wording a learner remembers moved between 2024 and 2026: Docker's unknown-command text, kubectl's `exec` rule, gcloud's "Maybe you meant", and `gcloud init`'s "sign in" prompt. A simulator should therefore name its target versions (gcloud 589, kubectl 1.34, Docker 29). It should store each output with a provenance flag (verbatim, observed or reconstructed) so that unverified strings can be swapped out later, mainly server-side 403 and 409 bodies, bq's unknown-command text and gcloud's deprecation warnings. The less obvious lesson is that the quiz and the canvas are the same machine. One grammar renders each node's "equivalent gcloud" line, grades typed answers, and produces the fix for a red edge. One rule table drives drop validation, ADC-style auto-wiring and the Packet Tracer-style score.

The research also moves the ACE difficulty from networking to identity. Most invalid edges are not missing cables. They are a missing `run.invoker`, a missing `iam.serviceAccountUser` (actAs) on a deploy, or a Google-managed service agent that lacks `pubsub.publisher`. Since mid-2024, default service accounts in new organizations no longer get Editor to hide those gaps. A lab that models post-2024 projects, shows each auto-granted role as a visible diff, and lets the learner trigger the real "Permission 'iam.serviceAccounts.actAs' denied" or "Your client does not have permission to get URL from this server" teaches the failures learners will actually meet. A lab that only checks whether two icons are connected does not.

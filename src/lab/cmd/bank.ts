/**
 * The command quiz: one section per area of the Commands cheat sheet. Each
 * question is a task ("Initialise, sign in and pick defaults in one go") and
 * is answered by typing the command into a Cloud Shell look-alike. Answers are
 * patterns (see grade.ts), so any spelling the real CLI accepts counts.
 *
 * Prompts stay in English, the way the cheat sheet and the exam word them;
 * explanations are in Indonesian, like the rest of the lab.
 */
import type { LabMeta } from '../types';
import type { CmdItem } from './grade';

export interface CmdSection extends LabMeta {
  /** The situation the questions assume — defaults already set, names in use. */
  intro: string;
  items: CmdItem[];
}

const q = (id: string, prompt: string, answers: string | string[], explain: string, more: Partial<CmdItem> = {}): CmdItem => ({
  id,
  prompt,
  answers: Array.isArray(answers) ? answers : [answers],
  explain,
  ...more
});

const SA = 'app-runner@ace-lab-123.iam.gserviceaccount.com';
const IMG = 'us-central1-docker.pkg.dev/ace-lab-123/apps';
const Z = '[--zone=us-central1-a]';

const start: CmdSection = {
  id: 'start',
  title: 'Memulai dan configuration',
  level: 'Dasar',
  summary: 'gcloud init, config set/get, named configuration, dan flag yang berlaku di semua perintah.',
  topics: ['gcloud init', 'gcloud config', 'Flag global'],
  intro: 'Cloud Shell baru dibuka. Project contoh bernama `ace-lab-123`; project lain yang ikut disebut adalah `ace-prod-123`.',
  items: [
    q('start-init', 'Initialise, sign in and pick defaults in one go', 'gcloud init', '`gcloud init` menjalankan tiga langkah sekaligus: login (seperti `gcloud auth login`), memilih atau membuat configuration, lalu memilih project dan region/zone default. Di Cloud Shell akunnya sudah login, jadi ia langsung menanyakan akun mana yang dipakai.', {
      hint: 'Perintahnya hanya satu kata setelah gcloud.',
      traps: [
        { when: /^gcloud auth init\b/, say: 'Tidak ada `gcloud auth init`. Grup `auth` hanya mengurus kredensial (login, list, revoke…); inisialisasi lengkap ada di level teratas: `gcloud init`.' },
        { when: /^gcloud auth login\b/, say: '`gcloud auth login` hanya login — ia tidak memilih configuration, project, atau zone default.' },
        { when: /^gcloud config/, say: '`gcloud config …` mengubah satu properti. Soal ini minta login + pilih default dalam satu perintah.' }
      ]
    }),
    q('start-version', 'Show the version and installed components', 'gcloud version', 'Menampilkan versi Google Cloud CLI beserta komponen yang terpasang (bq, gsutil, kubectl, alpha, beta…). `gcloud --version` mencetak hal yang sama.'),
    q('start-install', 'Install the `kubectl` component', 'gcloud components install kubectl', 'Menambah komponen ke CLI. Di Cloud Shell component manager sengaja dimatikan karena CLI dipasang lewat apt, jadi output-nya menyarankan `sudo apt-get install google-cloud-cli-kubectl`. Di laptop, perintah ini langsung memasang kubectl.'),
    q('start-update', 'Update the CLI and its components', 'gcloud components update', 'Memperbarui gcloud dan semua komponennya ke versi terbaru (atau ke `--version=…`).'),
    q('start-info', 'Show the current environment details: install path, active account, project and config directory', 'gcloud info', 'Ringkasan instalasi: versi Python, lokasi instalasi, direktori konfigurasi, akun dan project aktif. `--run-diagnostics` menambah tes jaringan.'),
    q('start-help', 'Open the reference page for `gcloud compute instances create`', ['gcloud help compute instances create', 'gcloud compute instances create --help'], '`gcloud help PERINTAH` dan `PERINTAH --help` membuka halaman manual yang sama: SYNOPSIS, flag wajib, contoh. `-h` hanya ringkasan singkat.'),
    q('start-search', "Search all of gcloud's help text for the word `snapshot`", 'gcloud help -- snapshot', 'Dengan `--`, gcloud help mencari kata itu di seluruh teks bantuan dan menampilkan perintah yang cocok. Tanpa `--`, kata pertama dianggap nama grup atau perintah.', {
      traps: [{ when: /^gcloud help snapshot$/, say: 'Tanpa `--`, `snapshot` dianggap nama perintah, bukan kata yang dicari. Tulis `gcloud help -- snapshot`.' }]
    }),
    q('start-topic', 'Read the supplementary help about filter expressions', 'gcloud topic filters', '`gcloud topic` berisi bantuan tambahan yang bukan perintah: filters, formats, configurations, datetimes, projections…'),
    q('start-project', 'Set the default project to `ace-lab-123`', ['gcloud config set project ace-lab-123', 'gcloud config set core/project ace-lab-123'], 'Properti `project` ada di section `core`, jadi `core/` boleh ditulis atau dihilangkan. Nilainya PROJECT_ID — bukan nama tampilan, bukan nomor project.'),
    q('start-zone', 'Set the default Compute Engine zone to `us-central1-a`', 'gcloud config set compute/zone us-central1-a', 'Properti di luar section `core` wajib ditulis lengkap dengan nama section-nya: `compute/zone`, `compute/region`, `run/region`.', {
      traps: [{ when: /config set zone\b/, say: 'Tanpa section, gcloud mencari `zone` di section `core` dan gagal. Zone ada di section compute: `compute/zone`.' }]
    }),
    q('start-region', 'Set the default region to `us-central1`', 'gcloud config set compute/region us-central1', 'Region default dipakai oleh resource regional (subnet, alamat IP, router) saat `--region` tidak ditulis. Cloud Run dan Cloud Run functions punya properti sendiri: `run/region` dan `functions/region`.'),
    q('start-get', 'Print just the active project ID, for use in a script', ['gcloud config get project', 'gcloud config get-value project', 'gcloud config get core/project', 'gcloud config get-value core/project'], '`gcloud config get` adalah nama resminya sejak versi 374. `get-value` masih jalan sebagai alias tersembunyi dan masih sering muncul di soal ujian — keduanya benar.'),
    q('start-list', 'List the properties of the active configuration', 'gcloud config list', 'Menampilkan semua properti yang diset di configuration aktif, dikelompokkan per section, lalu nama configuration-nya.'),
    q('start-cfg-create', 'Create a named configuration called `prod`', 'gcloud config configurations create prod', 'Configuration adalah satu set default bernama (akun, project, region, zone). `create` langsung mengaktifkannya kecuali diberi `--no-activate`.'),
    q('start-cfg-list', 'List all configurations and see which one is active', 'gcloud config configurations list', 'Tabelnya menunjukkan IS_ACTIVE, akun, project, zone dan region default tiap configuration.'),
    q('start-cfg-activate', 'Switch to the configuration named `dev`', 'gcloud config configurations activate dev', 'Mengganti configuration aktif untuk semua perintah berikutnya. Untuk satu perintah saja, pakai flag global `--configuration=dev`.', {
      traps: [{ when: /configurations (use|switch|select)\b/, say: 'Kata kerjanya `activate`.' }]
    }),
    q('start-cfg-describe', 'Inspect the `prod` configuration without activating it', 'gcloud config configurations describe prod', '`describe` menampilkan properti sebuah configuration tanpa mengaktifkannya.'),
    q('start-once', 'List the VMs of project `ace-prod-123` once, without changing your default project', 'gcloud compute instances list --project=ace-prod-123', '`--project` adalah flag global: berlaku untuk satu perintah itu saja, configuration aktif tidak berubah.', {
      traps: [{ when: /config set project/, say: '`gcloud config set project` mengubah default untuk semua perintah berikutnya — soal minta sekali jalan saja.' }]
    }),
    q('start-quiet', 'Delete VM `web-1` in `us-central1-a` from a script, with no confirmation prompt', 'gcloud compute instances delete web-1 --zone=us-central1-a --quiet', '`--quiet` (atau `-q`) menjawab semua prompt dengan pilihan default-nya — wajib di skrip dan pipeline CI.'),
    q('start-json', 'List VMs as JSON', 'gcloud compute instances list --format=json', '`--format` mengubah bentuk output: json, yaml, table(…), csv(…), value(…). `value(…)` paling enak untuk skrip.'),
    q('start-filter', 'List only the VMs whose status is `RUNNING`', 'gcloud compute instances list --filter="{status=RUNNING|status:RUNNING|status = RUNNING|status=running|status:running|status:(RUNNING)}"', '`--filter` menyaring baris di sisi gcloud memakai ekspresi `field=nilai` atau `field:nilai` (cocok sebagian). Lihat `gcloud topic filters`.'),
    q('start-debug', 'Run `gcloud compute instances list` with debug logging', 'gcloud compute instances list --verbosity=debug', '`--verbosity` mengatur banyaknya log: debug, info, warning (default), error, critical, none. `--log-http` menampilkan request API mentah.')
  ]
};

const auth: CmdSection = {
  id: 'auth',
  title: 'Kredensial, project dan IAM',
  level: 'Dasar',
  summary: 'auth login, service account, ADC, project, API, billing, IAM binding dan custom role.',
  topics: ['gcloud auth', 'IAM', 'Service account', 'Billing'],
  intro: `Project aktif \`ace-lab-123\`. Pengguna contoh: \`ana@example.com\`. Service account: \`${SA}\`.`,
  items: [
    q('auth-login', 'Sign in with your Google user account', 'gcloud auth login', 'Menyimpan kredensial user untuk gcloud sendiri. Kode aplikasi (client library) tidak memakainya — untuk itu ada ADC: `gcloud auth application-default login`. Di VM tanpa browser, tambahkan `--no-launch-browser`.'),
    q('auth-sa', 'Sign in as a service account using the key file `key.json`', ['gcloud auth activate-service-account --key-file=key.json', `gcloud auth activate-service-account ${SA} --key-file=key.json`], '`--key-file` wajib. Untuk produksi lebih baik melampirkan service account ke VM/Cloud Run atau memakai impersonation daripada menyimpan file kunci.'),
    q('auth-adc', 'Give code running on your machine (client libraries) Application Default Credentials', 'gcloud auth application-default login', 'ADC adalah kredensial yang dicari otomatis oleh client library Google. Ini terpisah dari kredensial gcloud — `gcloud auth login` tidak mengisinya.'),
    q('auth-list', 'List the accounts gcloud holds credentials for, and see which is active', 'gcloud auth list', 'Akun yang aktif ditandai `*`. Ganti akun aktif dengan `gcloud config set account AKUN`.'),
    q('auth-token', 'Print an OAuth 2.0 access token for the active account', 'gcloud auth print-access-token', 'Token ini dipakai sebagai `Authorization: Bearer …` untuk memanggil REST API langsung, misalnya dengan curl.'),
    q('auth-revoke', 'Remove the stored credentials of `old@example.com`', 'gcloud auth revoke old@example.com', 'Menghapus kredensial akun itu dari mesin ini. `--all` menghapus semuanya.'),
    q('auth-docker', 'Let Docker push to Artifact Registry in `us-central1`', 'gcloud auth configure-docker us-central1-docker.pkg.dev', 'Menulis credential helper `gcloud` ke ~/.docker/config.json untuk host itu. Ini hanya autentikasi — izin push tetap butuh `roles/artifactregistry.writer` pada repository.'),
    q('auth-projects', 'List the projects you can see', 'gcloud projects list', 'Kolomnya PROJECT_ID, NAME dan PROJECT_NUMBER — tiga identitas yang berbeda.'),
    q('auth-describe', 'Show project `ace-lab-123`, including its project number', 'gcloud projects describe ace-lab-123', 'Menampilkan projectId, projectNumber, parent (folder/organisasi), status dan waktu dibuat.'),
    q('auth-create', 'Create project `ace-dev-2026` inside folder `123456789`', 'gcloud projects create ace-dev-2026 --folder=123456789', 'Project ID harus 6–30 karakter, diawali huruf kecil, hanya huruf kecil, angka dan tanda hubung, serta unik secara global. Parent-nya `--folder` atau `--organization`, tidak keduanya.'),
    q('auth-folder', 'Create a folder called `Engineering` under organization `123456789012`', 'gcloud resource-manager folders create --display-name=Engineering --organization=123456789012', 'Folder mengelompokkan project di bawah organisasi; IAM yang diberikan di folder diwarisi oleh semua project di dalamnya.'),
    q('auth-enable', 'Enable the Compute Engine API', 'gcloud services enable compute.googleapis.com', 'Nama layanan ditulis lengkap: compute.googleapis.com, run.googleapis.com, sqladmin.googleapis.com… Beberapa nama bisa sekaligus dalam satu perintah.', {
      traps: [{ when: /^gcloud services enable compute$/, say: 'Nama API ditulis lengkap: `compute.googleapis.com`.' }]
    }),
    q('auth-enabled', 'List the APIs enabled in the project', ['gcloud services list --enabled', 'gcloud services list'], '`--enabled` adalah default; `--available` menampilkan semua API yang bisa diaktifkan.'),
    q('auth-billing', 'Link project `ace-lab-123` to billing account `012345-6789AB-CDEF01`', 'gcloud billing projects link ace-lab-123 --billing-account=012345-6789AB-CDEF01', 'API yang berbayar (Compute, GKE, Cloud Run…) baru bisa diaktifkan setelah project punya billing account. Yang menjalankan butuh `roles/billing.user` di billing account.'),
    q('auth-grant', 'Give `ana@example.com` the Viewer role on project `ace-lab-123`', 'gcloud projects add-iam-policy-binding ace-lab-123 --member=user:ana@example.com --role=roles/viewer', '`add-iam-policy-binding` menambah satu member ke satu role tanpa menyentuh binding lain. Member selalu diberi awalan tipe, role selalu ditulis lengkap.', {
      traps: [
        { when: /--member[= ]ana@/, say: 'Member diberi awalan tipe: `user:`, `group:`, `serviceAccount:`, atau `domain:`.' },
        { when: /--role[= ](viewer|Viewer)\b/, say: 'Nama role ditulis lengkap dengan awalan `roles/`: `roles/viewer`.' },
        { when: /set-iam-policy/, say: '`set-iam-policy` mengganti seluruh policy dari file — berisiko menghapus akses orang lain. Ujian lebih menyukai `add-iam-policy-binding`.' }
      ]
    }),
    q('auth-remove', 'Take the Viewer role on `ace-lab-123` away from `ana@example.com`', 'gcloud projects remove-iam-policy-binding ace-lab-123 --member=user:ana@example.com --role=roles/viewer', 'Kebalikan dari add-iam-policy-binding: hanya pasangan member–role itu yang dicabut.'),
    q('auth-policy', 'Show who has which role on project `ace-lab-123`', 'gcloud projects get-iam-policy ace-lab-123', 'Mencetak semua binding (role → member) plus etag. Untuk mencari satu orang, tambahkan `--flatten="bindings[].members" --filter=…`.'),
    q('auth-role', 'See which permissions `roles/storage.objectViewer` contains', 'gcloud iam roles describe roles/storage.objectViewer', 'Menampilkan `includedPermissions` sebuah role — cara cepat mengecek apakah role cukup sebelum memberikannya.'),
    q('auth-grantable', 'List the roles that can be granted on project `ace-lab-123`', 'gcloud iam list-grantable-roles //cloudresourcemanager.googleapis.com/projects/ace-lab-123', 'RESOURCE ditulis sebagai full resource name, diawali `//` dan nama layanannya.'),
    q('auth-custom', 'Create custom role `appAuditor` in project `ace-lab-123` from `role.yaml`', 'gcloud iam roles create appAuditor --project=ace-lab-123 --file=role.yaml', 'Custom role dibuat di project (`--project`) atau organisasi (`--organization`) — tepat salah satu. Isi file: title, description, stage, includedPermissions.'),
    q('auth-copy', 'Copy custom role `projects/ace-lab-123/roles/appAuditor` to project `ace-prod-123`, keeping the ID `appAuditor`', 'gcloud iam roles copy --source=projects/ace-lab-123/roles/appAuditor --destination=appAuditor --dest-project=ace-prod-123', 'Custom role level project hanya ada di project itu; `copy` membuat salinannya di project atau organisasi lain.'),
    q('auth-sa-create', 'Create a service account called `app-runner`', 'gcloud iam service-accounts create app-runner', 'Nama service account 6–30 karakter, huruf kecil, angka dan tanda hubung. Email-nya menjadi `app-runner@ace-lab-123.iam.gserviceaccount.com`.'),
    q('auth-keys-list', `List the keys of \`${SA}\``, `gcloud iam service-accounts keys list --iam-account=${SA}`, 'Kunci yang dikelola user (USER_MANAGED) adalah risiko kebocoran — audit dan hapus yang tidak dipakai.'),
    q('auth-keys-create', 'Create a JSON key for that service account, saved as `key.json`', `gcloud iam service-accounts keys create key.json --iam-account=${SA}`, 'Bisa, tapi hindari bila mungkin: melampirkan service account ke resource, impersonation, atau Workload Identity Federation tidak meninggalkan file kunci. Organisasi baru sering memblokirnya lewat org policy.'),
    q('auth-actas', `Let \`ana@example.com\` attach \`${SA}\` to the VMs and services they deploy`, `gcloud iam service-accounts add-iam-policy-binding ${SA} --member=user:ana@example.com --role=roles/iam.serviceAccountUser`, '`roles/iam.serviceAccountUser` memberi izin `actAs`: syarat untuk memasang service account ke VM, Cloud Run atau function. Diberikan pada service account-nya sendiri, bukan di level project, supaya sempit.'),
    q('auth-setpolicy', "Replace that service account's whole IAM policy with `policy.json`", `gcloud iam service-accounts set-iam-policy ${SA} policy.json`, '`set-iam-policy` menimpa seluruh policy dengan isi file. Ambil dulu dengan `get-iam-policy`, ubah, lalu set — etag mencegah menimpa perubahan orang lain.', {
      traps: [{ when: /set-iam-policy-binding/, say: 'Cheat sheet resmi Google pernah menulis `set-iam-policy-binding`, tapi perintah itu tidak ada. Yang ada: `add-iam-policy-binding` (tambah satu) dan `set-iam-policy` (ganti semua).' }]
    }),
    q('auth-impersonate', `List your buckets as \`${SA}\` without a key file`, `gcloud storage ls --impersonate-service-account=${SA}`, 'Impersonation meminta token jangka pendek atas nama service account. Akunmu butuh `roles/iam.serviceAccountTokenCreator` pada service account itu.')
  ]
};

const compute: CmdSection = {
  id: 'compute',
  title: 'Compute Engine',
  level: 'Menengah',
  summary: 'VM, Spot, SSH lewat IAP, disk dan snapshot, image, instance template, MIG dan autoscaling.',
  topics: ['Compute Engine', 'MIG', 'Snapshot', 'Image'],
  intro: 'Project `ace-lab-123`. `compute/zone` sudah diset ke `us-central1-a` dan `compute/region` ke `us-central1`, jadi `--zone`/`--region` boleh dihilangkan — kalau ditulis, nilainya harus cocok.',
  items: [
    q('vm-zones', 'List the zones available to the project', 'gcloud compute zones list', 'Nama zone = region + huruf: us-central1-a, us-central1-b… Tidak semua region memakai huruf a.'),
    q('vm-list', 'List the VMs in the project', 'gcloud compute instances list', 'Tanpa `--zones`, gcloud menampilkan VM dari semua zone.'),
    q('vm-describe', 'Show every setting of VM `web-1`', `gcloud compute instances describe web-1 ${Z}`, 'Output YAML lengkap: machineType, disk, networkInterfaces, serviceAccounts, metadata, scheduling…'),
    q('vm-create', 'Create VM `web-1` with machine type `e2-medium` from the Debian 12 image family', `gcloud compute instances create web-1 --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud ${Z}`, 'Image publik ditulis sebagai family + project pemiliknya. Family selalu menunjuk versi terbaru yang tidak deprecated.', {
      traps: [{ when: /--image[= ]debian-12\b/, say: '`debian-12` adalah image family, jadi pakai `--image-family=debian-12` plus `--image-project=debian-cloud`.' }]
    }),
    q('vm-spot', 'Create Spot VM `batch-1`', `gcloud compute instances create batch-1 --provisioning-model=SPOT ${Z}`, 'Spot VM jauh lebih murah tapi bisa dihentikan kapan saja dengan pemberitahuan 30 detik; cocok untuk batch yang tahan gangguan.', {
      traps: [{ when: /--preemptible/, say: 'Preemptible adalah model lama (maksimal 24 jam). Spot VM ditulis `--provisioning-model=SPOT`.' }]
    }),
    q('vm-noip', 'Create VM `db-1` with no external IP address', `gcloud compute instances create db-1 --no-address ${Z}`, 'Tanpa IP eksternal, VM butuh Cloud NAT untuk keluar ke internet dan IAP untuk SSH dari luar.'),
    q('vm-stop', 'Stop VM `web-1`', `gcloud compute instances stop web-1 ${Z}`, 'VM yang berhenti tidak ditagih CPU/RAM, tapi disk dan IP statis tetap ditagih.'),
    q('vm-type', 'Change `web-1` (already stopped) to machine type `e2-standard-4`', `gcloud compute instances set-machine-type web-1 --machine-type=e2-standard-4 ${Z}`, 'Machine type hanya bisa diganti saat VM berhenti. Untuk MIG, buat instance template baru lalu rolling update.'),
    q('vm-ssh', 'SSH into `web-1`', `gcloud compute ssh web-1 ${Z}`, 'gcloud membuat kunci SSH sendiri dan menaruhnya di metadata (atau memakai OS Login), lalu membuka sesi.'),
    q('vm-iap', 'SSH into `db-1`, which has no external IP, through Identity-Aware Proxy', `gcloud compute ssh db-1 --tunnel-through-iap ${Z}`, 'IAP TCP forwarding datang dari 35.235.240.0/20, jadi firewall harus mengizinkan tcp:22 dari rentang itu, dan penggunanya butuh `roles/iap.tunnelResourceAccessor`.'),
    q('vm-startup', 'Add the startup script in `start.sh` to `web-1`', `gcloud compute instances add-metadata web-1 --metadata-from-file=startup-script=start.sh ${Z}`, 'Startup script disimpan sebagai metadata `startup-script` dan dijalankan setiap boot.'),
    q('vm-sa', `Attach service account \`${SA}\` to the stopped VM \`web-1\`, with the \`cloud-platform\` scope`, `gcloud compute instances set-service-account web-1 --service-account=${SA} --scopes={cloud-platform|https://www.googleapis.com/auth/cloud-platform} ${Z}`, 'Praktik yang dianjurkan: scope `cloud-platform` dan kendalikan akses lewat role IAM service account-nya. VM harus berhenti dulu.'),
    q('vm-oslogin', 'Turn on OS Login for every VM in the project', 'gcloud compute project-info add-metadata --metadata={enable-oslogin=TRUE|enable-oslogin=true}', 'Metadata level project berlaku untuk semua VM. Dengan OS Login, akses SSH diatur lewat IAM (`roles/compute.osLogin` / `osAdminLogin`), bukan kunci di metadata.'),
    q('vm-snap', 'Snapshot the boot disk of `web-1` (the disk is also named `web-1`)', `gcloud compute disks snapshot web-1 ${Z}`, 'Snapshot bersifat inkremental dan disimpan multi-regional secara default. Nama snapshot bisa diatur dengan `--snapshot-names`.'),
    q('vm-snap-del', 'Delete snapshot `snap-1`', 'gcloud compute snapshots delete snap-1', 'Snapshot adalah resource global, jadi tidak ada flag zone.'),
    q('vm-schedule', 'Create snapshot schedule `daily-2am`: every day at 02:00, keeping 7 days of snapshots', 'gcloud compute resource-policies create snapshot-schedule daily-2am --start-time=02:00 --daily-schedule --max-retention-days=7 [--region=us-central1]', 'Jadwal snapshot adalah resource policy regional; setelah dibuat, pasang ke disk dengan `disks add-resource-policies`. Jam ditulis dalam UTC.'),
    q('vm-attach-schedule', 'Attach schedule `daily-2am` to disk `data-1`', `gcloud compute disks add-resource-policies data-1 --resource-policies=daily-2am ${Z}`, 'Satu jadwal bisa dipasang ke banyak disk di region yang sama.'),
    q('vm-resize', 'Grow disk `data-1` to 200 GB', `gcloud compute disks resize data-1 --size=200GB ${Z}`, 'Disk hanya bisa diperbesar, tidak bisa diperkecil. Setelahnya, file system di dalam VM juga perlu diperbesar (kecuali image yang melakukannya otomatis saat boot).'),
    q('vm-image', 'Create image `golden-v1` from disk `web-1`', `gcloud compute images create golden-v1 --source-disk=web-1 [--source-disk-zone=us-central1-a]`, 'Image dipakai untuk membuat banyak VM yang identik. Hentikan VM dulu (atau pakai `--force`) supaya isinya konsisten.'),
    q('vm-image-snap', 'Create image `golden-v2` from snapshot `snap-1`', 'gcloud compute images create golden-v2 --source-snapshot=snap-1', 'Sumber image harus tepat satu: --source-disk, --source-snapshot, --source-image, --source-image-family, atau --source-uri.'),
    q('vm-windows', 'List the public Windows Server images', 'gcloud compute images list --project=windows-cloud --no-standard-images', 'Image publik tinggal di project pemiliknya (debian-cloud, windows-cloud…). `--no-standard-images` menyembunyikan project publik lain.'),
    q('vm-template', 'Create instance template `web-tpl`: `e2-medium`, Debian 12 family, network tag `web`', 'gcloud compute instance-templates create web-tpl --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud --tags=web', 'Instance template tidak bisa diubah. Untuk perubahan, buat template baru lalu jalankan rolling update di MIG.'),
    q('vm-mig', 'Create managed instance group `web-mig` of 3 VMs from `web-tpl` in zone `us-central1-a`', `gcloud compute instance-groups managed create web-mig --template=web-tpl --size=3 ${Z}`, 'MIG menjaga jumlah VM, mengganti yang mati (autohealing), dan bisa autoscale serta rolling update.'),
    q('vm-rmig', 'Create regional MIG `web-rmig` of 3 VMs from `web-tpl` spread across `us-central1`', 'gcloud compute instance-groups managed create web-rmig --template=web-tpl --size=3 --region=us-central1', 'MIG regional menyebar VM ke beberapa zone, jadi tetap hidup saat satu zone gangguan — jawaban untuk soal high availability.'),
    q('vm-autoscale', 'Autoscale `web-mig` between 2 and 10 VMs at 60% CPU', `gcloud compute instance-groups managed set-autoscaling web-mig --min-num-replicas=2 --max-num-replicas=10 --target-cpu-utilization={0.6|0.60|.6} ${Z}`, 'Target CPU ditulis sebagai pecahan 0.0–1.0, bukan persen.', {
      traps: [{ when: /target-cpu-utilization[= ]60\b/, say: 'Nilainya pecahan 0.0–1.0: 60% ditulis `0.6`.' }]
    }),
    q('vm-rolling', 'Roll out instance template `web-tpl-v2` to `web-mig`', `gcloud compute instance-groups managed rolling-action start-update web-mig --version=template=web-tpl-v2 ${Z}`, 'Rolling update mengganti VM bertahap sesuai maxSurge/maxUnavailable. `--canary-version=template=…,target-size=10%` menguji ke sebagian VM dulu.'),
    q('vm-mig-resize', 'Resize `web-mig` to 5 VMs by hand', `gcloud compute instance-groups managed resize web-mig --size=5 ${Z}`, 'Kalau autoscaler aktif, ukuran manual akan ditimpa autoscaler — matikan dulu atau ubah min/max-nya.'),
    q('vm-autoheal', 'Add health check `hc-http` to `web-mig` for autohealing, with a 300-second initial delay', `gcloud compute instance-groups managed update web-mig --health-check=hc-http --initial-delay={300|300s|5m} ${Z}`, 'Initial delay memberi waktu VM baru untuk boot sebelum health check bisa menandainya rusak dan membuatnya ulang.')
  ]
};

const network: CmdSection = {
  id: 'network',
  title: 'VPC, subnet dan firewall',
  level: 'Menengah',
  summary: 'VPC custom, subnet, Private Google Access, firewall rule, alamat IP, peering, Cloud Router dan Cloud NAT.',
  topics: ['VPC', 'Firewall', 'Cloud NAT', 'Peering'],
  intro: 'Project `ace-lab-123`, `compute/region` = `us-central1`, jadi `--region` boleh dihilangkan. VPC contoh bernama `prod-vpc`.',
  items: [
    q('net-vpc', 'Create custom-mode VPC `prod-vpc`', 'gcloud compute networks create prod-vpc --subnet-mode=custom', 'Mode custom: kamu yang membuat subnet di region yang dibutuhkan. Mode auto membuat satu subnet /20 di setiap region — praktis untuk coba-coba, tapi rentangnya bisa bentrok saat peering.'),
    q('net-global', 'Create custom-mode VPC `hub-vpc` whose Cloud Routers advertise routes across all regions', 'gcloud compute networks create hub-vpc --subnet-mode=custom --bgp-routing-mode=global', 'Dynamic routing GLOBAL membuat route yang dipelajari lewat VPN/Interconnect berlaku di semua region, bukan hanya region Cloud Router-nya.'),
    q('net-subnet', 'Create subnet `web-subnet` in `prod-vpc`, region `us-central1`, range `10.0.1.0/24`', 'gcloud compute networks subnets create web-subnet --network=prod-vpc --range=10.0.1.0/24 [--region=us-central1]', 'VPC itu global, subnet itu regional. Empat alamat di tiap subnet dicadangkan Google.'),
    q('net-expand', 'Grow `web-subnet` to a /20', 'gcloud compute networks subnets expand-ip-range web-subnet --prefix-length=20 [--region=us-central1]', 'Rentang primer subnet bisa diperluas tanpa downtime, tapi tidak bisa diperkecil, dan rentang barunya tidak boleh bentrok.'),
    q('net-pga', 'Let VMs without external IPs in `web-subnet` reach Google APIs', 'gcloud compute networks subnets update web-subnet --enable-private-ip-google-access [--region=us-central1]', 'Private Google Access diatur per subnet. Ia membuka akses ke API Google saja (Cloud Storage, BigQuery…), bukan ke internet umum — untuk itu perlu Cloud NAT.'),
    q('net-http', 'Allow HTTP from anywhere to VMs tagged `web` in `prod-vpc`, with rule `allow-http`', 'gcloud compute firewall-rules create allow-http --network=prod-vpc --allow=tcp:80 --target-tags=web [--source-ranges=0.0.0.0/0] [--direction={INGRESS|IN}]', 'Tanpa --source-ranges dan --source-tags, sumbernya 0.0.0.0/0. Arah default INGRESS, prioritas default 1000.', {
      traps: [{ when: /--allow[= ]http\b/, say: 'Protokol ditulis `tcp:80` — firewall bekerja di layer 4, tidak mengenal "http".' }]
    }),
    q('net-iap', "Allow SSH only from Identity-Aware Proxy's range into `prod-vpc`, with rule `allow-iap-ssh`", 'gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20 [--direction={INGRESS|IN}]', 'Semua koneksi IAP TCP forwarding datang dari 35.235.240.0/20. Dengan rule ini, port 22 tidak perlu dibuka ke 0.0.0.0/0.'),
    q('net-hc', 'Allow Google health checks to reach port 80 on VMs tagged `web` in `prod-vpc`, with rule `allow-hc`', 'gcloud compute firewall-rules create allow-hc --network=prod-vpc --allow=tcp:80 --source-ranges=130.211.0.0/22,35.191.0.0/16 --target-tags=web [--direction={INGRESS|IN}]', 'Health check load balancer datang dari 130.211.0.0/22 dan 35.191.0.0/16. Tanpa rule ini backend dianggap tidak sehat dan LB mengembalikan 502.'),
    q('net-deny', 'Block all outbound traffic from `prod-vpc` VMs to `0.0.0.0/0` at priority 65000, with rule `deny-egress`', 'gcloud compute firewall-rules create deny-egress --network=prod-vpc --direction={EGRESS|OUT} --action=DENY --rules=all --destination-ranges=0.0.0.0/0 --priority=65000', 'Bentuk `--action` + `--rules` dipakai untuk DENY. Angka prioritas lebih kecil menang, jadi rule allow untuk tujuan tertentu cukup diberi prioritas di bawah 65000.'),
    q('net-fw-list', 'List the firewall rules', 'gcloud compute firewall-rules list', 'Ingat dua rule implisit yang tidak tampil: deny semua ingress dan allow semua egress, di prioritas terendah.'),
    q('net-ext-ip', 'Reserve a static external IP called `web-ip` in `us-central1`', 'gcloud compute addresses create web-ip --region=us-central1', 'Alamat regional dipakai VM dan Network LB di region itu. IP statis yang tidak terpasang tetap ditagih.'),
    q('net-global-ip', 'Reserve a global static IP called `lb-ip` for an external Application Load Balancer', 'gcloud compute addresses create lb-ip --global', 'External Application Load Balancer global memakai alamat anycast global; VM memakai alamat regional.'),
    q('net-int-ip', 'Reserve internal address `10.0.1.10` in `web-subnet` as `db-ip`', 'gcloud compute addresses create db-ip --subnet=web-subnet --addresses=10.0.1.10 [--region=us-central1]', 'Alamat internal statis memastikan VM atau internal LB selalu memakai IP yang sama.'),
    q('net-peer', 'Peer `prod-vpc` with `shared-vpc`, naming this side `prod-to-shared`', 'gcloud compute networks peerings create prod-to-shared --network=prod-vpc --peer-network=shared-vpc', 'Peering harus dibuat dari kedua sisi sebelum ACTIVE. Rentang subnet tidak boleh bentrok dan peering tidak transitif.'),
    q('net-router', 'Create Cloud Router `nat-router` for `prod-vpc` in `us-central1`', 'gcloud compute routers create nat-router --network=prod-vpc [--region=us-central1]', 'Cloud Router dibutuhkan oleh Cloud NAT, HA VPN dan Interconnect. Ia regional.'),
    q('net-nat', 'Give private VMs internet egress: NAT `prod-nat` on `nat-router`, auto-allocated IPs, every subnet range', 'gcloud compute routers nats create prod-nat --router=nat-router --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges [--region=us-central1]', 'Cloud NAT hanya untuk koneksi keluar; ia tidak pernah menerima koneksi masuk yang tidak diminta. Ia regional, jadi tiap region butuh NAT sendiri.')
  ]
};

const lb: CmdSection = {
  id: 'lb',
  title: 'DNS, load balancing dan Cloud Armor',
  level: 'Lanjut',
  summary: 'Zone DNS publik dan privat, lalu rangkaian external Application Load Balancer: health check sampai forwarding rule.',
  topics: ['Cloud DNS', 'Load balancing', 'Cloud Armor'],
  intro: 'Project `ace-lab-123`. MIG `web-mig` di `us-central1-a` dan service Cloud Run `hello` sudah ada; alamat global `lb-ip` sudah dipesan.',
  items: [
    q('dns-public', 'Create public DNS zone `example-zone` for `example.com`', 'gcloud dns managed-zones create example-zone --dns-name=example.com.', 'Nama DNS ditulis lengkap dengan titik di akhir (FQDN). Setelah dibuat, arahkan NS record di registrar ke name server zone ini.'),
    q('dns-private', 'Create private DNS zone `corp-zone` for `corp.internal`, visible only to `prod-vpc`', 'gcloud dns managed-zones create corp-zone --dns-name=corp.internal. --visibility=private --networks=prod-vpc', 'Zone privat hanya bisa di-resolve dari VPC yang didaftarkan.'),
    q('dns-record', 'Add an A record `www.example.com` → `34.120.10.20` with TTL 300 to `example-zone`', 'gcloud dns record-sets create {www.example.com.|www.example.com} --zone=example-zone --type=A --ttl=300 --rrdatas=34.120.10.20', 'Record set = nama + tipe + TTL + data. Satu nama dan tipe bisa punya beberapa nilai di --rrdatas.'),
    q('lb-hc', 'Create HTTP health check `hc-http` on port 80', 'gcloud compute health-checks create http hc-http --port=80 [--global]', 'Health check dipakai backend service (dan autohealing MIG). Backend serverless (Cloud Run) tidak memakai health check.'),
    q('lb-backend', 'Create global backend service `web-backend` (protocol HTTP, health check `hc-http`) for an external Application Load Balancer', 'gcloud compute backend-services create web-backend --protocol=HTTP --health-checks=hc-http --global [--load-balancing-scheme={EXTERNAL_MANAGED|EXTERNAL}]', 'Backend service menyimpan daftar backend, health check, dan tempat memasang Cloud CDN serta Cloud Armor. EXTERNAL_MANAGED adalah LB global generasi baru; EXTERNAL yang classic.'),
    q('lb-add', 'Add MIG `web-mig` in zone `us-central1-a` to `web-backend`', 'gcloud compute backend-services add-backend web-backend --instance-group=web-mig --instance-group-zone=us-central1-a --global', 'Satu backend service bisa memuat MIG dari beberapa region — LB global mengirim pengguna ke backend terdekat yang sehat.'),
    q('lb-map', 'Create URL map `web-map` that sends every request to `web-backend`', 'gcloud compute url-maps create web-map --default-service=web-backend', 'URL map memetakan host dan path ke backend service atau backend bucket.'),
    q('lb-proxy', 'Create target HTTP proxy `web-proxy` for `web-map`', 'gcloud compute target-http-proxies create web-proxy --url-map=web-map', 'Untuk HTTPS, pakai target-https-proxies dengan `--ssl-certificates`.'),
    q('lb-fr', 'Create global forwarding rule `web-fr` on port 80 using address `lb-ip` and proxy `web-proxy`', 'gcloud compute forwarding-rules create web-fr --global --target-http-proxy=web-proxy --ports=80 --address=lb-ip [--load-balancing-scheme={EXTERNAL_MANAGED|EXTERNAL}]', 'Forwarding rule adalah frontend: IP + port yang dituju pengguna. Urutan lengkapnya: health check → backend service → URL map → target proxy → forwarding rule.'),
    q('lb-neg', 'Create serverless NEG `run-neg` in `us-central1` for Cloud Run service `hello`', 'gcloud compute network-endpoint-groups create run-neg --region=us-central1 --network-endpoint-type=serverless --cloud-run-service=hello', 'Serverless NEG menghubungkan Application Load Balancer ke Cloud Run, Cloud Run functions atau App Engine. NEG-nya harus di region yang sama dengan service-nya.'),
    q('lb-armor', 'In security policy `edge-policy`, deny `203.0.113.0/24` with a 403 at priority 1000', 'gcloud compute security-policies rules create 1000 --security-policy=edge-policy --src-ip-ranges=203.0.113.0/24 --action=deny-403', 'Cloud Armor dipasang di backend service dan memfilter di edge Google sebelum trafik sampai ke backend.')
  ]
};

const gke: CmdSection = {
  id: 'gke',
  title: 'GKE dan Artifact Registry (sisi gcloud)',
  level: 'Menengah',
  summary: 'Autopilot dan Standard, get-credentials, node pool, resize, autoscaling, upgrade, repository image.',
  topics: ['GKE', 'Artifact Registry', 'Node pool'],
  intro: '`compute/zone` = `us-central1-a`; gcloud container memakainya sebagai lokasi default, jadi `--zone` boleh dihilangkan. Cluster contoh: `std-1`.',
  items: [
    q('gke-auto', 'Create Autopilot cluster `auto-1` in `us-central1`', 'gcloud container clusters create-auto auto-1 --region=us-central1', 'Autopilot: Google mengelola node, kamu bayar per Pod. Ia selalu regional dan selalu di release channel. `--location` juga diterima.'),
    q('gke-std', 'Create Standard zonal cluster `std-1` with 3 nodes', `gcloud container clusters create std-1 [--num-nodes=3] ${Z}`, 'Standard: kamu yang mengatur node pool. Default-nya 3 node e2-medium.'),
    q('gke-list', 'List your GKE clusters', 'gcloud container clusters list', 'Kolomnya mencakup lokasi, versi control plane, jumlah node dan status.'),
    q('gke-creds', 'Point kubectl at `std-1`', `gcloud container clusters get-credentials std-1 ${Z}`, 'Menulis entry kubeconfig (context `gke_PROJECT_LOKASI_CLUSTER`) supaya kubectl bisa bicara ke cluster ini.'),
    q('gke-pool', 'Add node pool `high-mem` to `std-1`: 2 nodes of `n2-highmem-4`', `gcloud container node-pools create high-mem --cluster=std-1 --machine-type=n2-highmem-4 --num-nodes=2 ${Z}`, 'Node pool = sekelompok node dengan konfigurasi sama. Dipakai saat workload butuh mesin berbeda.'),
    q('gke-spot', 'Add node pool `spot-pool` of Spot VMs to `std-1`', `gcloud container node-pools create spot-pool --cluster=std-1 --spot ${Z}`, 'Node Spot murah tapi bisa ditarik kapan saja — taruh workload yang tahan gangguan di sana dengan taint/toleration.'),
    q('gke-resize', 'Resize node pool `default-pool` of `std-1` to 5 nodes', [`gcloud container clusters resize std-1 --node-pool=default-pool --num-nodes=5 ${Z}`, `gcloud container clusters resize std-1 --node-pool=default-pool --size=5 ${Z}`], 'Untuk cluster zonal, angkanya total node; untuk regional, jumlah per zone. `--size` sudah deprecated, pakai `--num-nodes`.', {
      traps: [{ when: /^kubectl scale/, say: '`kubectl scale` mengubah jumlah Pod. Jumlah node diatur dari gcloud.' }]
    }),
    q('gke-autoscale', 'Turn on cluster autoscaling for `default-pool` of `std-1`: 1 to 5 nodes', [`gcloud container clusters update std-1 --enable-autoscaling --node-pool=default-pool --min-nodes=1 --max-nodes=5 ${Z}`, `gcloud container node-pools update default-pool --cluster=std-1 --enable-autoscaling --min-nodes=1 --max-nodes=5 ${Z}`], 'Cluster autoscaler menambah node saat ada Pod yang tidak muat, dan menguranginya saat node kosong. Ini berbeda dari HPA yang mengatur jumlah Pod.'),
    q('gke-upgrade', 'Upgrade the control plane of `std-1`', `gcloud container clusters upgrade std-1 --master ${Z}`, 'Control plane di-upgrade dulu, baru node pool. Dengan release channel, Google melakukannya otomatis.'),
    q('gke-private', 'Create cluster `priv-1` whose nodes have no external IPs', `gcloud container clusters create priv-1 --enable-private-nodes [--enable-ip-alias] [--master-ipv4-cidr=<ANY>] ${Z}`, 'Node privat hanya punya IP internal; untuk menarik image dari internet mereka butuh Cloud NAT.'),
    q('gke-wi', 'Create cluster `wi-1` with Workload Identity Federation for GKE enabled', `gcloud container clusters create wi-1 --workload-pool=ace-lab-123.svc.id.goog ${Z}`, 'Workload Identity Federation for GKE membuat Pod memakai identitas IAM tanpa file kunci. Workload pool selalu PROJECT_ID.svc.id.goog.'),
    q('gke-channel', 'Create cluster `reg-1` on the `regular` release channel', `gcloud container clusters create reg-1 --release-channel=regular ${Z}`, 'Release channel (rapid, regular, stable, extended) mengatur seberapa cepat versi baru dipasang otomatis.'),
    q('gke-delete', 'Delete cluster `std-1`', `gcloud container clusters delete std-1 ${Z}`, 'Menghapus control plane dan semua node. Disk persisten dari PVC dengan reclaim policy Retain tetap tersisa.'),
    q('ar-repo', 'Create Docker repository `apps` in Artifact Registry, region `us-central1`', 'gcloud artifacts repositories create apps --repository-format=docker --location=us-central1', 'Container Registry (gcr.io) sudah ditutup untuk penulisan sejak Maret 2025; image baru disimpan di Artifact Registry: REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG.'),
    q('ar-tags', `List the tags of image \`${IMG}/web\``, `gcloud artifacts docker tags list ${IMG}/web`, 'Nama lama dari cheat sheet, `gcloud container images list-tags`, ditujukan untuk Container Registry.'),
    q('ar-reader', 'Let GKE nodes that run as `gke-nodes@ace-lab-123.iam.gserviceaccount.com` pull from repository `apps`', 'gcloud artifacts repositories add-iam-policy-binding apps --location=us-central1 --member=serviceAccount:gke-nodes@ace-lab-123.iam.gserviceaccount.com --role=roles/artifactregistry.reader', 'Node menarik image dengan service account node-nya. Tanpa `artifactregistry.reader`, Pod berakhir di ImagePullBackOff.')
  ]
};

const serverless: CmdSection = {
  id: 'serverless',
  title: 'Cloud Run, functions dan App Engine',
  level: 'Menengah',
  summary: 'Deploy publik dan privat, deploy dari source, canary dan pembagian trafik, job, function, App Engine.',
  topics: ['Cloud Run', 'Cloud Run functions', 'App Engine'],
  intro: `Region Cloud Run tidak ikut compute/region dan properti \`run/region\` belum diset, jadi tulis \`--region=us-central1\`. Image ada di \`${IMG}\`.`,
  items: [
    q('run-public', 'Deploy image `us-docker.pkg.dev/cloudrun/container/hello` as public Cloud Run service `hello` in `us-central1`', ['gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=us-central1 --allow-unauthenticated', 'gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=us-central1 --no-invoker-iam-check'], '`--allow-unauthenticated` memberi `roles/run.invoker` ke allUsers. Di organisasi dengan Domain Restricted Sharing itu ditolak; cara yang kini dianjurkan adalah `--no-invoker-iam-check`.'),
    q('run-private', `Deploy image \`${IMG}/api:v1\` as service \`api\` in \`us-central1\` that only authenticated callers can invoke`, `gcloud run deploy api --image=${IMG}/api:v1 --region=us-central1 [--no-allow-unauthenticated] [--invoker-iam-check]`, 'Tanpa akses publik, pemanggil butuh `roles/run.invoker` dan mengirim ID token. Untuk service baru gcloud akan menanyakannya; `--no-allow-unauthenticated` menjawab tidak.'),
    q('run-source', 'Deploy the source code in the current directory as service `web` in `us-central1`', 'gcloud run deploy web --source=. --region=us-central1', 'Dengan `--source`, Cloud Build membangun image (dari Dockerfile atau buildpacks) dan menyimpannya di Artifact Registry sebelum deploy.'),
    q('run-canary', `Deploy \`${IMG}/api:v2\` to \`api\` as a revision tagged \`canary\` that gets no traffic yet`, `gcloud run deploy api --image=${IMG}/api:v2 --region=us-central1 --no-traffic --tag=canary`, 'Revision baru bisa dites lewat URL tag (https://canary---api-…run.app) sebelum menerima trafik produksi.'),
    q('run-split', 'Send 90% of `api` traffic to revision `api-00001-abc` and 10% to `api-00002-xyz`', 'gcloud run services update-traffic api --to-revisions=api-00001-abc=90,api-00002-xyz=10 --region=us-central1', 'Persentase per revision harus berjumlah 100. Kalau revision diberi tag, `--to-tags=canary=10` juga bisa.'),
    q('run-latest', 'Send all `api` traffic to the newest revision', 'gcloud run services update-traffic api --to-latest --region=us-central1', '`--to-latest` sama dengan `--to-revisions=LATEST=100`; deploy berikutnya juga otomatis menerima trafik.'),
    q('run-invoker', 'Let `scheduler@ace-lab-123.iam.gserviceaccount.com` invoke the private service `api`', 'gcloud run services add-iam-policy-binding api --region=us-central1 --member=serviceAccount:scheduler@ace-lab-123.iam.gserviceaccount.com --role=roles/run.invoker', 'Untuk service-to-service, Cloud Scheduler, Pub/Sub push dan Eventarc: pemanggilnya butuh `roles/run.invoker` pada service itu.'),
    q('run-min', 'Keep at least 1 instance of `api` warm to avoid cold starts', 'gcloud run services update api --min-instances=1 --region=us-central1', 'Instance minimum mengurangi cold start tapi ditagih walau tidak ada request.'),
    q('run-job', `Create Cloud Run job \`nightly\` from image \`${IMG}/batch:v1\` with 10 tasks in \`us-central1\``, `gcloud run jobs create nightly --image=${IMG}/batch:v1 --tasks=10 --region=us-central1`, 'Cloud Run job menjalankan container sampai selesai (bukan melayani HTTP). Task bisa paralel dan diulang saat gagal.'),
    q('run-exec', 'Run job `nightly` now', 'gcloud run jobs execute nightly --region=us-central1', 'Untuk menjadwalkan, panggil endpoint job ini dari Cloud Scheduler.'),
    q('fn-http', 'Deploy HTTP function `hello-fn` (Python 3.12) in `us-central1`', 'gcloud functions deploy hello-fn --runtime=python312 --trigger-http --region=us-central1 [--gen2]', 'Sejak September 2024 `gcloud functions deploy` membuat function generasi ke-2 (Cloud Run functions) secara default, jadi `--gen2` tidak lagi wajib. `--runtime` wajib untuk function baru.'),
    q('fn-bucket', 'Deploy function `thumb` (Node.js 22) that runs whenever a file lands in bucket `uploads-bkt`', 'gcloud functions deploy thumb --runtime=nodejs22 --trigger-bucket=uploads-bkt --region=us-central1 [--gen2]', 'Trigger bucket memakai Eventarc (event object finalized). Lokasi trigger harus sama dengan lokasi bucket, dan service agent Cloud Storage butuh `roles/pubsub.publisher`.'),
    q('fn-topic', 'Deploy function `on-order` (Go 1.23) triggered by Pub/Sub topic `orders`', 'gcloud functions deploy on-order --runtime=go123 --trigger-topic=orders --region=us-central1 [--gen2]', '`--trigger-topic` menerima nama topic saja, bukan `projects/…/topics/…`.'),
    q('gae-create', 'Create the App Engine application in region `us-central`', 'gcloud app create --region=us-central', 'Satu project hanya punya satu aplikasi App Engine dan region-nya tidak bisa diganti. Nama region App Engine tanpa angka: us-central, europe-west.'),
    q('gae-deploy', 'Deploy the app described by `app.yaml` in the current directory', ['gcloud app deploy', 'gcloud app deploy app.yaml'], 'Tanpa argumen, gcloud memakai app.yaml di direktori aktif. Versi baru langsung menerima semua trafik (promote).'),
    q('gae-project', 'Deploy the same app to project `ace-prod-123` instead', ['gcloud app deploy --project=ace-prod-123', 'gcloud app deploy app.yaml --project=ace-prod-123'], 'Flag global `--project` memilih project untuk satu perintah tanpa mengubah configuration.'),
    q('gae-nopromote', 'Deploy version `v2` without sending it any traffic', ['gcloud app deploy --version=v2 --no-promote', 'gcloud app deploy app.yaml --version=v2 --no-promote'], '`--no-promote` men-deploy tanpa memindahkan trafik — lalu bagi trafik bertahap dengan `services set-traffic`.'),
    q('gae-split', 'Split the traffic of service `default`: 90% to `v1`, 10% to `v2`', 'gcloud app services set-traffic default --splits=v1=0.9,v2=0.1', 'Bobot boleh pecahan (0.9/0.1) atau angka (90/10). `--split-by` memilih cara membagi: ip (default), cookie, atau random.'),
    q('gae-versions', 'List the versions of the app', 'gcloud app versions list', 'Menampilkan versi, pembagian trafik dan status tiap versi; versi lama yang masih SERVING bisa tetap ditagih.'),
    q('gae-browse', 'Open the app in a browser', 'gcloud app browse', 'Di Cloud Shell tidak ada browser, jadi gcloud mencetak URL-nya.'),
    q('gae-logs', 'Read the latest App Engine logs', 'gcloud app logs read', 'Untuk mengikuti log secara langsung, pakai `gcloud app logs tail`.')
  ]
};

const messaging: CmdSection = {
  id: 'messaging',
  title: 'Pub/Sub, logging dan Scheduler',
  level: 'Menengah',
  summary: 'Topic dan subscription (pull, push, dead letter), Cloud Scheduler, membaca log, sink, retensi, metric.',
  topics: ['Pub/Sub', 'Cloud Logging', 'Cloud Scheduler'],
  intro: 'Project `ace-lab-123`. Service Cloud Run privat `api` ada di `https://api-abc123-uc.a.run.app`.',
  items: [
    q('ps-topic', 'Create Pub/Sub topic `orders`', 'gcloud pubsub topics create orders', 'Topic menerima pesan dari publisher; pesan disimpan sampai setiap subscription meng-ack-nya.'),
    q('ps-pull', 'Create pull subscription `orders-sub` on `orders` with a 60-second ack deadline', 'gcloud pubsub subscriptions create orders-sub --topic=orders --ack-deadline=60', 'Ack deadline 10–600 detik (default 10). Kalau tidak di-ack dalam waktu itu, pesan dikirim ulang.'),
    q('ps-push', 'Create push subscription `orders-push` on `orders` that delivers to `https://api-abc123-uc.a.run.app/push`', 'gcloud pubsub subscriptions create orders-push --topic=orders --push-endpoint=https://api-abc123-uc.a.run.app/push', 'Endpoint push harus HTTPS publik. Untuk Cloud Run privat, tambahkan `--push-auth-service-account=…` dan beri service account itu `roles/run.invoker`.'),
    q('ps-dlq', 'Create subscription `orders-dlq-sub` on `orders` that moves a message to topic `orders-dead` after 5 failed deliveries', 'gcloud pubsub subscriptions create orders-dlq-sub --topic=orders --dead-letter-topic=orders-dead --max-delivery-attempts=5', 'Max delivery attempts 5–100. Service agent Pub/Sub butuh publisher di topic dead letter dan subscriber di subscription asal.'),
    q('ps-publish', 'Publish the message `hello` to `orders`', 'gcloud pubsub topics publish orders --message=hello', 'Pesan bisa membawa atribut dengan `--attribute=kunci=nilai`.'),
    q('ps-pullmsg', 'Pull and acknowledge up to 5 messages from `orders-sub`', 'gcloud pubsub subscriptions pull orders-sub --auto-ack --limit=5', 'Tanpa `--auto-ack`, pesan hanya dilihat dan akan dikirim ulang setelah ack deadline lewat.'),
    q('sch-http', 'Create Cloud Scheduler job `nightly-ping` in `us-central1` that POSTs to `https://api-abc123-uc.a.run.app/run` every day at 02:00, authenticated as `scheduler@ace-lab-123.iam.gserviceaccount.com`', 'gcloud scheduler jobs create http nightly-ping --location=us-central1 --schedule="0 2 * * *" --uri=https://api-abc123-uc.a.run.app/run --http-method=POST --oidc-service-account-email=scheduler@ace-lab-123.iam.gserviceaccount.com', 'Jadwal memakai format unix-cron lima kolom (menit jam tanggal bulan hari). OIDC token dipakai untuk Cloud Run; service account-nya butuh `roles/run.invoker`.'),
    q('log-list', 'List the log names in the project', 'gcloud logging logs list', 'Contoh nama log: cloudaudit.googleapis.com%2Factivity, run.googleapis.com%2Frequests, syslog.'),
    q('log-read', 'Read the 20 most recent entries with severity ERROR or higher', 'gcloud logging read "{severity>=ERROR|severity >= ERROR}" --limit=20', 'Filter-nya memakai bahasa query Logging yang sama dengan Logs Explorer. `--freshness` mengatur seberapa jauh ke belakang (default 1 hari).'),
    q('log-sink', 'Route every log entry to BigQuery dataset `audit_logs` in `ace-lab-123` with sink `audit-sink`', 'gcloud logging sinks create audit-sink bigquery.googleapis.com/projects/ace-lab-123/datasets/audit_logs', 'Sink menulis memakai writer identity-nya sendiri — berikan identitas itu `roles/bigquery.dataEditor` di dataset, kalau tidak entri gagal ditulis. `--log-filter` membatasi entri yang dikirim.'),
    q('log-retention', 'Keep logs in the `_Default` bucket for 90 days', 'gcloud logging buckets update _Default --location=global --retention-days=90', 'Bucket `_Default` menyimpan 30 hari (bisa 1–3650); `_Required` (audit Admin Activity) selalu 400 hari dan tidak bisa diubah.'),
    q('log-metric', 'Create log-based metric `error_count` that counts entries with severity ERROR', 'gcloud logging metrics create error_count --log-filter="{severity=ERROR|severity>=ERROR|severity = ERROR}"', 'Log-based metric bisa dipakai di dashboard dan alert policy Cloud Monitoring.')
  ]
};

const ops: CmdSection = {
  id: 'ops',
  title: 'Cloud SQL, keamanan dan build',
  level: 'Lanjut',
  summary: 'Instance Cloud SQL, HA, replika, backup, ekspor; KMS dan Secret Manager; Cloud Build; Infrastructure Manager; budget.',
  topics: ['Cloud SQL', 'Cloud KMS', 'Secret Manager', 'Cloud Build'],
  intro: `Project \`ace-lab-123\`, region \`us-central1\`. Service account aplikasi: \`${SA}\`.`,
  items: [
    q('sql-create', 'Create Cloud SQL for MySQL 8.0 instance `orders-db` in `us-central1` with 2 vCPUs and 7.5 GB of RAM', ['gcloud sql instances create orders-db --database-version=MYSQL_8_0 --tier=db-custom-2-7680 --region=us-central1', 'gcloud sql instances create orders-db --database-version=MYSQL_8_0 --cpu=2 --memory={7680MB|7.5GB|7680MiB|7.5GiB|7680} --region=us-central1'], 'Tier custom ditulis db-custom-CPU-MEMORI_MB (memori kelipatan 256 MB, 0,9–6,5 GB per vCPU), atau pakai `--cpu` dan `--memory`.'),
    q('sql-ha', 'Make `orders-db` highly available across zones', 'gcloud sql instances patch orders-db --availability-type=regional', 'REGIONAL = instance standby di zone lain dengan failover otomatis. Replika baca tidak memberi HA.'),
    q('sql-authnet', 'Allow the office range `203.0.113.0/24` to connect to `orders-db` over its public IP', 'gcloud sql instances patch orders-db --authorized-networks=203.0.113.0/24', 'Authorized networks hanya untuk IP publik. Cloud SQL Auth Proxy / connector tidak memerlukannya karena memakai IAM (`roles/cloudsql.client`).'),
    q('sql-replica', 'Create read replica `orders-replica` of `orders-db`', 'gcloud sql instances create orders-replica --master-instance-name=orders-db', 'Replika baca melayani query baca dan bisa di region lain (cross-region) untuk DR; ia bisa dipromosikan menjadi instance mandiri.'),
    q('sql-connect', 'Connect to `orders-db` with the mysql client as `root`', 'gcloud sql connect orders-db --user=root', 'gcloud memasukkan IP-mu ke allowlist selama 5 menit lalu membuka client mysql.'),
    q('sql-backup', 'Take an on-demand backup of `orders-db`', 'gcloud sql backups create --instance=orders-db', 'Backup on-demand tidak dihapus otomatis seperti backup terjadwal.'),
    q('sql-export', 'Export database `shop` of `orders-db` to `gs://ace-backups/shop.sql`', 'gcloud sql export sql orders-db gs://ace-backups/shop.sql --database=shop', 'Yang menulis ke bucket adalah service account instance Cloud SQL, jadi ia butuh izin tulis di bucket itu.'),
    q('sql-import', 'Import `gs://ace-backups/shop.sql` into database `shop` on `orders-db`', 'gcloud sql import sql orders-db gs://ace-backups/shop.sql --database=shop', 'Service account instance butuh izin baca di bucket. Untuk CSV ada `gcloud sql import csv`.'),
    q('kms-key', 'Create encryption key `app-key` in key ring `app-ring`, location `global`', 'gcloud kms keys create app-key --keyring=app-ring --location=global --purpose=encryption', 'Key ring dan key tidak bisa dihapus (hanya versi kuncinya yang bisa dihancurkan). `--rotation-period` mengatur rotasi otomatis.'),
    q('kms-decrypt', 'Decrypt `secret.enc` into `secret.txt` with key `app-key` in key ring `app-ring`, location `global`', 'gcloud kms decrypt --key=app-key --keyring=app-ring --location=global --ciphertext-file=secret.enc --plaintext-file=secret.txt', 'Butuh `roles/cloudkms.cryptoKeyDecrypter`. Perintahnya tidak mencetak apa-apa; hasilnya ditulis ke file plaintext.'),
    q('sec-create', 'Store the contents of `pass.txt` as secret `db-pass`', 'gcloud secrets create db-pass --data-file=pass.txt [--replication-policy=automatic]', 'Secret Manager menyimpan versi-versi rahasia; replikasi automatic dipilih Google, user-managed memilih region sendiri.'),
    q('sec-access', 'Print the latest version of secret `db-pass`', 'gcloud secrets versions access latest --secret=db-pass', 'Butuh `roles/secretmanager.secretAccessor`. Cloud Run bisa memasang secret sebagai env var atau volume.'),
    q('sec-grant', `Let \`${SA}\` read secret \`db-pass\``, `gcloud secrets add-iam-policy-binding db-pass --member=serviceAccount:${SA} --role=roles/secretmanager.secretAccessor`, 'Diberikan pada secret-nya sendiri, bukan level project — least privilege.'),
    q('build-submit', `Build the Dockerfile in the current directory with Cloud Build and push the result as \`${IMG}/web:v1\``, [`gcloud builds submit --tag=${IMG}/web:v1`, `gcloud builds submit . --tag=${IMG}/web:v1`], 'Build berjalan di Google, jadi tidak perlu Docker lokal. Untuk langkah lebih dari satu, pakai `--config=cloudbuild.yaml`.'),
    q('im-preview', `Preview Infrastructure Manager deployment \`web-stack\` in \`us-central1\` from the Terraform files in \`./infra\`, running as \`${SA}\`, without creating anything`, [`gcloud infra-manager previews create projects/ace-lab-123/locations/us-central1/previews/web-stack --service-account=projects/ace-lab-123/serviceAccounts/${SA} --local-source=./infra`, `gcloud infra-manager previews create web-stack --location=us-central1 --service-account=projects/ace-lab-123/serviceAccounts/${SA} --local-source=./infra`], 'Preview menjalankan `terraform plan`: menunjukkan apa yang akan dibuat, diubah atau dihapus tanpa menyentuh resource. Infrastructure Manager (Terraform terkelola) menggantikan Deployment Manager, yang end of support sejak 2026.'),
    q('im-apply', `Apply the changed Terraform files in \`./infra\` to the existing Infrastructure Manager deployment \`web-stack\` in \`us-central1\`, running as \`${SA}\``, [`gcloud infra-manager deployments apply projects/ace-lab-123/locations/us-central1/deployments/web-stack --service-account=projects/ace-lab-123/serviceAccounts/${SA} --local-source=./infra`, `gcloud infra-manager deployments apply web-stack --location=us-central1 --service-account=projects/ace-lab-123/serviceAccounts/${SA} --local-source=./infra`], '`apply` membuat deployment baru atau memperbarui yang sudah ada dengan `terraform apply`; resource yang tidak berubah dibiarkan.'),
    q('budget', 'Create a 100 USD budget named `lab-budget` on billing account `012345-6789AB-CDEF01`, alerting at 90%', 'gcloud billing budgets create --billing-account=012345-6789AB-CDEF01 --display-name=lab-budget --budget-amount={100USD|100.00USD|100} --threshold-rule={percent=0.9|percent=0.90}', 'Budget hanya mengirim peringatan — ia tidak menghentikan pemakaian. Untuk memotong otomatis, sambungkan ke Pub/Sub dan Cloud Run function.')
  ]
};

const kubeLook: CmdSection = {
  id: 'kubectl-look',
  title: 'kubectl: konteks dan melihat isi cluster',
  level: 'Dasar',
  summary: 'Context dan namespace, get/describe, log, exec, port-forward, top, event, auth can-i.',
  topics: ['kubectl', 'GKE', 'Debugging'],
  intro: 'kubectl sudah diarahkan ke cluster `std-1` lewat get-credentials. Pod contoh: `web-7d4b9`; node contoh: `gke-std-1-default-pool-1a2b`.',
  items: [
    q('kc-contexts', 'List the contexts in your kubeconfig', 'kubectl config get-contexts', 'Context = cluster + user + namespace. Tanda `*` menunjukkan yang aktif.'),
    q('kc-current', 'Show which context is active', 'kubectl config current-context', 'Mencetak satu baris: nama context aktif.'),
    q('kc-use', 'Switch to context `gke_ace-lab-123_us-central1-a_std-1`', 'kubectl config use-context gke_ace-lab-123_us-central1-a_std-1', 'Nama context GKE: gke_PROJECT_LOKASI_CLUSTER, dibuat oleh get-credentials.'),
    q('kc-view', 'Show the kubeconfig', 'kubectl config view', 'Rahasia seperti token ditampilkan sebagai REDACTED kecuali dengan `--raw`.'),
    q('kc-ns', 'Make `shop` the default namespace of the current context', 'kubectl config set-context --current --namespace=shop', 'Setelah ini, perintah tanpa `-n` otomatis memakai namespace shop.'),
    q('kc-info', 'Show the address of the cluster control plane', 'kubectl cluster-info', 'Untuk diagnosa lengkap ada `kubectl cluster-info dump`.'),
    q('kc-nodes', 'List the nodes', 'kubectl get nodes', 'STATUS Ready berarti kubelet sehat; versi node bisa tertinggal dari control plane.'),
    q('kc-wide', 'List the pods with the node and IP of each', 'kubectl get pods -o wide', '`-o wide` menambah kolom IP, NODE dan lainnya. `get pod` dan `get po` juga benar.'),
    q('kc-all', 'List everything in namespace `shop`', 'kubectl get all -n shop', '`all` mencakup pod, service, deployment, replicaset — tapi tidak configmap atau secret.'),
    q('kc-allns', 'List the pods in every namespace', 'kubectl get pods -A', '`-A` sama dengan `--all-namespaces`.'),
    q('kc-svc', 'List the services and their external IPs', 'kubectl get services', 'Untuk Service LoadBalancer, EXTERNAL-IP bertuliskan <pending> sampai Google selesai membuat load balancer-nya.'),
    q('kc-describe', 'Find out why pod `web-7d4b9` is stuck in Pending', 'kubectl describe pod web-7d4b9', 'Pending berarti scheduler belum menemukan node — alasannya (Insufficient cpu, taint, PVC…) ada di Events.', {
      traps: [{ when: /^kubectl logs/, say: 'Pod yang Pending belum pernah jalan, jadi belum ada log. Alasannya ada di bagian Events pada `describe`.' }]
    }),
    q('kc-logs', 'Follow the logs of `web-7d4b9`', 'kubectl logs -f web-7d4b9', '`-f` mengikuti log terus; `-c` memilih container di pod yang punya lebih dari satu.'),
    q('kc-prev', 'Show the logs of the previous, crashed container of `web-7d4b9`', 'kubectl logs web-7d4b9 --previous', 'Untuk CrashLoopBackOff: log container yang sedang jalan sering kosong; penyebabnya ada di container sebelumnya.'),
    q('kc-exec', 'Open an interactive shell in `web-7d4b9`', 'kubectl exec -it web-7d4b9 -- {sh|/bin/sh|bash|/bin/bash}', 'Perintah untuk container ditulis setelah `--`. Bentuk lama tanpa `--` sudah ditolak oleh kubectl versi baru.'),
    q('kc-pf', 'Reach port 80 of `web-7d4b9` on local port 8080', 'kubectl port-forward web-7d4b9 8080:80', 'Urutannya LOKAL:REMOTE. Bisa juga ke service: `kubectl port-forward svc/web 8080:80`.'),
    q('kc-top', 'Show the CPU and memory use of the pods', 'kubectl top pods', 'Butuh metrics-server, yang di GKE sudah terpasang.'),
    q('kc-events', 'List recent events, oldest first', 'kubectl get events --sort-by=.metadata.creationTimestamp', 'Event hanya disimpan sekitar satu jam.'),
    q('kc-cani', 'Check whether you may create deployments in namespace `shop`', 'kubectl auth can-i create {deployments|deployment|deploy} -n shop', 'Menjawab yes/no berdasarkan RBAC Kubernetes (dan IAM di GKE).')
  ]
};

const kubeDeploy: CmdSection = {
  id: 'kubectl-deploy',
  title: 'kubectl: deploy, scale dan update',
  level: 'Menengah',
  summary: 'apply, create deployment, expose, scale, HPA, set image, rollout, secret, configmap, cordon dan drain.',
  topics: ['kubectl', 'Deployment', 'HPA'],
  intro: 'kubectl terhubung ke `std-1`. Deployment contoh `web` dengan container bernama `nginx`; node contoh `gke-std-1-default-pool-1a2b`.',
  items: [
    q('kd-apply', 'Create or update the objects in `deployment.yaml`', 'kubectl apply -f deployment.yaml', '`apply` bersifat deklaratif: membuat yang belum ada dan memperbarui yang berubah. `create` gagal kalau objeknya sudah ada.'),
    q('kd-delete', 'Delete everything `deployment.yaml` created', 'kubectl delete -f deployment.yaml', 'Menghapus objek yang didefinisikan di file itu.'),
    q('kd-create', 'Create deployment `web` from image `nginx:1.27`', 'kubectl create deployment web --image=nginx:1.27', 'Cara cepat imperatif; untuk produksi tulis manifest dan `apply`.'),
    q('kd-expose', 'Expose `web` on an external load balancer: port 80 to container port 8080', 'kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080', 'Service LoadBalancer di GKE membuat passthrough Network Load Balancer. Untuk HTTP(S) dengan path/host, pakai Ingress atau Gateway.'),
    q('kd-scale', 'Run 5 replicas of `web`', 'kubectl scale deployment web --replicas=5', 'Ini mengubah jumlah Pod. Jumlah node diatur dari gcloud (resize atau cluster autoscaler).', {
      traps: [{ when: /^gcloud container clusters resize/, say: '`clusters resize` mengubah jumlah node, bukan jumlah Pod.' }]
    }),
    q('kd-hpa', 'Autoscale `web` between 2 and 10 pods at 60% CPU', 'kubectl autoscale deployment web --min=2 --max=10 --cpu=60%', 'Membuat HorizontalPodAutoscaler. kubectl 1.34 memakai `--cpu=60%`; `--cpu-percent=60` dari materi lama masih jalan dengan peringatan deprecated.'),
    q('kd-image', 'Update container `nginx` of `web` to image `nginx:1.28` (rolling update)', 'kubectl set image deployment/web nginx=nginx:1.28', 'Formatnya NAMA_CONTAINER=IMAGE. Deployment lalu mengganti Pod bertahap.', {
      traps: [{ when: /set image deployment[ /]web nginx:1\.28$/, say: 'Sebutkan nama container-nya: `nginx=nginx:1.28`.' }]
    }),
    q('kd-status', 'Watch the rollout of `web` until it finishes', 'kubectl rollout status deployment/web', 'Menunggu sampai semua replika versi baru siap, atau gagal setelah progressDeadlineSeconds.'),
    q('kd-history', 'Show the rollout history of `web`', 'kubectl rollout history deployment/web', 'Setiap perubahan template Pod membuat revision baru.'),
    q('kd-undo', 'Roll `web` back to the previous revision', 'kubectl rollout undo deployment/web', '`--to-revision=N` kembali ke revision tertentu.'),
    q('kd-restart', 'Restart all pods of `web` without changing its spec', 'kubectl rollout restart deployment/web', 'Memicu rolling restart — berguna setelah ConfigMap atau Secret berubah.'),
    q('kd-secret', 'Store password `s3cr3t` under key `password` in secret `db-creds`', 'kubectl create secret generic db-creds --from-literal=password=s3cr3t', 'Isi Secret hanya di-base64, bukan dienkripsi; GKE mengenkripsi etcd di belakang layar, dan untuk rahasia penting pertimbangkan Secret Manager.'),
    q('kd-cm', 'Create configmap `app-config` from the file `app.properties`', 'kubectl create configmap app-config --from-file=app.properties', 'Nama file menjadi kunci, isinya menjadi nilai.'),
    q('kd-ns', 'Create namespace `shop`', 'kubectl create namespace shop', 'Namespace memisahkan objek, quota dan RBAC di dalam satu cluster.'),
    q('kd-cordon', 'Stop new pods from landing on node `gke-std-1-default-pool-1a2b`', 'kubectl cordon gke-std-1-default-pool-1a2b', 'Pod yang sudah jalan tetap di sana; hanya penjadwalan baru yang dihentikan.'),
    q('kd-drain', 'Evict the pods from that node for maintenance', 'kubectl drain gke-std-1-default-pool-1a2b --ignore-daemonsets', 'Node GKE selalu menjalankan DaemonSet sistem, jadi tanpa `--ignore-daemonsets` drain akan menolak. Pod dengan emptyDir butuh `--delete-emptydir-data`.'),
    q('kd-uncordon', 'Put the node back into service', 'kubectl uncordon gke-std-1-default-pool-1a2b', 'Node kembali menerima Pod baru.'),
    q('kd-label', 'Add the label `tier=frontend` to deployment `web`', 'kubectl label deployment web tier=frontend', 'Label adalah dasar selector Service, Deployment dan NetworkPolicy. `--overwrite` untuk mengganti nilai yang sudah ada.')
  ]
};

const storage: CmdSection = {
  id: 'storage',
  title: 'Cloud Storage: gcloud storage dan gsutil',
  level: 'Dasar',
  summary: 'Bucket, upload paralel, rsync, lifecycle, versioning, storage class, IAM, signed URL, retensi, notifikasi.',
  topics: ['Cloud Storage', 'gcloud storage', 'gsutil'],
  intro: 'Bucket contoh: `ace-assets-123`. Kedua alat diterima: `gcloud storage` (yang direkomendasikan Google) atau `gsutil` (lama, masih jalan dan masih muncul di soal).',
  items: [
    q('gcs-mb', 'Create bucket `ace-assets-123` in the `US` multi-region', ['gcloud storage buckets create gs://ace-assets-123 --location=US', 'gsutil mb -l US gs://ace-assets-123'], 'Nama bucket unik secara global, 3–63 karakter huruf kecil, angka, - _ dan titik. Lokasi tidak bisa diganti setelah dibuat.'),
    q('gcs-mb-class', 'Create bucket `ace-archive-123` in `us-central1` with default class `NEARLINE` and uniform bucket-level access', ['gcloud storage buckets create gs://ace-archive-123 --location=us-central1 --default-storage-class=NEARLINE --uniform-bucket-level-access', 'gsutil mb -l us-central1 -c NEARLINE -b on gs://ace-archive-123'], 'Nearline (min. 30 hari), Coldline (90), Archive (365): makin murah disimpan, makin mahal diambil. Uniform access mematikan ACL per objek sehingga akses hanya lewat IAM.'),
    q('gcs-ls', 'List the objects in `ace-assets-123`', ['gcloud storage ls gs://ace-assets-123', 'gsutil ls gs://ace-assets-123'], '`-r` untuk rekursif, `-l` untuk ukuran dan tanggal.'),
    q('gcs-stat', 'Show the metadata of `gs://ace-assets-123/logo.png`', ['gcloud storage objects describe gs://ace-assets-123/logo.png', 'gsutil stat gs://ace-assets-123/logo.png'], 'Ukuran, content type, storage class, hash, generation.'),
    q('gcs-cp', 'Upload the folder `./site` and everything in it to `ace-assets-123`, in parallel', ['gcloud storage cp -r ./site gs://ace-assets-123', 'gsutil -m cp -r ./site gs://ace-assets-123', 'gsutil -m cp -R ./site gs://ace-assets-123'], 'gcloud storage paralel secara default; gsutil butuh flag tingkat atas `-m` yang ditulis sebelum nama perintah.', {
      traps: [{ when: /^gsutil cp .*-m\b/, say: 'Untuk gsutil, `-m` adalah opsi tingkat atas: `gsutil -m cp …`.' }]
    }),
    q('gcs-rsync', 'Make `gs://ace-assets-123/site` mirror the folder `./site`', ['gcloud storage rsync -r ./site gs://ace-assets-123/site', 'gsutil [-m] rsync -r ./site gs://ace-assets-123/site'], 'rsync hanya menyalin yang berubah. Menghapus file yang tidak ada di sumber butuh `--delete-unmatched-destination-objects` (gsutil: `-d`).'),
    q('gcs-mv', 'Rename `gs://ace-assets-123/a.txt` to `gs://ace-assets-123/b.txt`', ['gcloud storage mv gs://ace-assets-123/a.txt gs://ace-assets-123/b.txt', 'gsutil mv gs://ace-assets-123/a.txt gs://ace-assets-123/b.txt'], 'Cloud Storage tidak punya rename sungguhan: mv menyalin lalu menghapus yang lama.'),
    q('gcs-rm', 'Delete bucket `ace-temp-123` and everything in it', ['gcloud storage rm -r gs://ace-temp-123', 'gsutil rm -r gs://ace-temp-123', 'gsutil rm -R gs://ace-temp-123'], 'Dengan `-r` pada URL bucket, isi dan bucket-nya ikut terhapus. `gcloud storage buckets delete` hanya untuk bucket kosong.'),
    q('gcs-lifecycle', 'Apply the lifecycle rules in `rules.json` to `ace-assets-123`', ['gcloud storage buckets update gs://ace-assets-123 --lifecycle-file=rules.json', 'gsutil lifecycle set rules.json gs://ace-assets-123'], 'Lifecycle rule memindahkan class (SetStorageClass) atau menghapus (Delete) objek berdasarkan umur, versi, atau class.'),
    q('gcs-versioning', 'Turn on object versioning for `ace-assets-123`', ['gcloud storage buckets update gs://ace-assets-123 --versioning', 'gsutil versioning set on gs://ace-assets-123'], 'Versi lama (noncurrent) tetap ditagih; biasanya dipasangkan dengan lifecycle rule numNewerVersions atau daysSinceNoncurrentTime.'),
    q('gcs-defclass', 'Change the default storage class of `ace-assets-123` to `COLDLINE`', ['gcloud storage buckets update gs://ace-assets-123 --default-storage-class=COLDLINE', 'gsutil defstorageclass set {COLDLINE|coldline|Coldline} gs://ace-assets-123'], 'Default class hanya berlaku untuk objek baru; objek yang sudah ada tetap di class lamanya.'),
    q('gcs-rewrite', 'Move the existing object `gs://ace-assets-123/2024.zip` to the `ARCHIVE` class', ['gcloud storage objects update gs://ace-assets-123/2024.zip --storage-class=ARCHIVE', 'gsutil rewrite -s {ARCHIVE|archive} gs://ace-assets-123/2024.zip'], 'Mengganti class objek yang sudah ada berarti menulis ulang datanya (rewrite).'),
    q('gcs-iam', 'Give `ana@example.com` read access to the objects in `ace-assets-123`', ['gcloud storage buckets add-iam-policy-binding gs://ace-assets-123 --member=user:ana@example.com --role=roles/storage.objectViewer', 'gsutil iam ch {user:ana@example.com:objectViewer|user:ana@example.com:roles/storage.objectViewer} gs://ace-assets-123'], 'gsutil iam ch menerima nama role pendek (objectViewer); gcloud storage memakai nama lengkap.'),
    q('gcs-public', 'Make every object in `ace-public-123` publicly readable', ['gcloud storage buckets add-iam-policy-binding gs://ace-public-123 --member=allUsers --role=roles/storage.objectViewer', 'gsutil iam ch {allUsers:objectViewer|allUsers:roles/storage.objectViewer} gs://ace-public-123'], 'Kalau public access prevention aktif (default di banyak organisasi), binding allUsers akan ditolak.'),
    q('gcs-signed', 'Create a 10-minute signed URL for `gs://ace-assets-123/report.pdf` using the key file `key.json`', ['gcloud storage sign-url gs://ace-assets-123/report.pdf --duration=10m --private-key-file=key.json', 'gsutil signurl -d 10m key.json gs://ace-assets-123/report.pdf'], 'Signed URL memberi akses sementara tanpa akun Google; maksimal 7 hari.'),
    q('gcs-retention', 'Stop objects in `ace-records-123` from being deleted or overwritten for 30 days', ['gcloud storage buckets update gs://ace-records-123 --retention-period=30d', 'gsutil retention set 30d gs://ace-records-123'], 'Retention policy menahan objek sampai umurnya lewat; setelah di-lock, ia tidak bisa dikurangi atau dihapus.'),
    q('gcs-notify', 'Publish a message to topic `uploads` whenever an object in `ace-assets-123` changes', ['gcloud storage buckets notifications create gs://ace-assets-123 --topic=uploads', 'gsutil notification create -t uploads -f json gs://ace-assets-123'], 'Service agent Cloud Storage butuh `roles/pubsub.publisher` di topic itu.'),
    q('gcs-web', 'Serve `ace-site-123` as a static website with `index.html` as the main page and `404.html` for errors', ['gcloud storage buckets update gs://ace-site-123 --web-main-page-suffix=index.html --web-error-page=404.html', 'gsutil web set -m index.html -e 404.html gs://ace-site-123'], 'Untuk HTTPS dengan domain sendiri, pasang bucket sebagai backend bucket di external Application Load Balancer.'),
    q('gcs-du', 'Show the total size of `ace-assets-123`', ['gcloud storage du -s gs://ace-assets-123', 'gsutil du -s gs://ace-assets-123'], '`-s` merangkum jadi satu angka; tambahkan `--readable-sizes` (gsutil: `-h`) supaya mudah dibaca.')
  ]
};

const BQ_ORDERS = '{ace-lab-123:sales.orders|sales.orders}';

const bigquery: CmdSection = {
  id: 'bq',
  title: 'BigQuery dengan bq',
  level: 'Menengah',
  summary: 'Dataset dan tabel, partisi, load CSV/JSON, query standard SQL, dry run, head, extract, copy, hapus.',
  topics: ['BigQuery', 'bq'],
  intro: 'Project aktif `ace-lab-123`, jadi awalan `ace-lab-123:` di depan dataset boleh dihilangkan. Dataset contoh: `sales`.',
  items: [
    q('bq-mkds', 'Create dataset `sales` in the `US` location', 'bq --location={US|us} mk [--dataset] {ace-lab-123:sales|sales}', 'Lokasi dataset tidak bisa diganti, dan query tidak bisa menggabungkan dataset dari lokasi berbeda. Flag global seperti `--location` ditulis sebelum nama perintah.'),
    q('bq-mktable', 'Create table `sales.orders` from the schema file `schema.json`', `bq mk [--table] ${BQ_ORDERS} schema.json`, 'Skema bisa berupa file JSON atau inline: `nama:STRING,jumlah:INTEGER`.'),
    q('bq-part', 'Create table `sales.events` partitioned on its `ts` column, schema in `schema.json`', ['bq mk [--table] --time_partitioning_field=ts {ace-lab-123:sales.events|sales.events} schema.json', 'bq mk [--table] --time_partitioning_field=ts --schema=schema.json {ace-lab-123:sales.events|sales.events}'], 'Partisi membuat query yang memfilter `ts` hanya memindai partisi yang relevan — lebih cepat dan murah. Default granularitasnya harian.'),
    q('bq-load', 'Load `gs://ace-data-123/orders.csv` into `sales.orders`, detecting the schema', `bq load [--source_format=CSV] --autodetect ${BQ_ORDERS} gs://ace-data-123/orders.csv`, 'CSV adalah format default. `--skip_leading_rows=1` untuk melewati baris header bila skemanya ditulis sendiri.'),
    q('bq-json', 'Load the newline-delimited JSON file `gs://ace-data-123/events.json` into `sales.events`', 'bq load --source_format=NEWLINE_DELIMITED_JSON [--autodetect] {ace-lab-123:sales.events|sales.events} gs://ace-data-123/events.json', 'BigQuery membaca JSON satu objek per baris, bukan array JSON.'),
    q('bq-query', 'Count the rows of `sales.orders` using standard SQL', 'bq query --use_legacy_sql=false <SQL>', 'Tanpa `--use_legacy_sql=false`, bq memakai legacy SQL (kecuali diubah di ~/.bigqueryrc). `--nouse_legacy_sql` juga benar.', {
      display: "bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM sales.orders'",
      traps: [{ when: /^bq query(?!.*(use_legacy_sql=false|nouse_legacy_sql))/, say: 'Tanpa `--use_legacy_sql=false`, query dijalankan sebagai legacy SQL.' }]
    }),
    q('bq-dry', 'Find out how many bytes a query on `sales.orders` would scan, without running it', 'bq query --use_legacy_sql=false --dry_run <SQL>', 'Dry run melaporkan byte yang akan dipindai — dasar perkiraan biaya on-demand — tanpa biaya.', {
      display: "bq query --use_legacy_sql=false --dry_run 'SELECT * FROM sales.orders'"
    }),
    q('bq-ls', 'List the datasets in the project', 'bq ls', 'Tanpa argumen, bq ls menampilkan dataset di project default.'),
    q('bq-lstables', 'List the tables in `sales`', 'bq ls {ace-lab-123:sales|sales}', 'Dengan nama dataset, bq ls menampilkan tabel dan view di dalamnya.'),
    q('bq-show', 'Show the schema and details of `sales.orders`', `bq show [--schema] ${BQ_ORDERS}`, 'Menampilkan skema, jumlah baris, ukuran, partisi dan clustering.'),
    q('bq-head', 'Preview the first 10 rows of `sales.orders` without running a query', `bq head -n 10 ${BQ_ORDERS}`, '`bq head` membaca langsung dari storage, jadi tidak ditagih seperti query.'),
    q('bq-extract', 'Export `sales.orders` to CSV files matching `gs://ace-exports-123/orders-*.csv`', `bq extract [--destination_format=CSV] ${BQ_ORDERS} gs://ace-exports-123/orders-*.csv`, 'Wildcard `*` dibutuhkan bila tabelnya lebih dari 1 GB, karena satu file ekspor dibatasi 1 GB.'),
    q('bq-cp', 'Copy `sales.orders` to `sales.orders_backup`', `bq cp ${BQ_ORDERS} {ace-lab-123:sales.orders_backup|sales.orders_backup}`, 'Copy tabel dalam lokasi yang sama tidak ditagih seperti query.'),
    q('bq-rm', 'Delete dataset `sales` and all of its tables', 'bq rm -r [-d] [-f] {ace-lab-123:sales|sales}', '`-r` menghapus tabel di dalamnya; tanpa `-f` bq meminta konfirmasi.'),
    q('bq-job', 'Show the details of job `bqjob_r1a2b3c4_0001`', 'bq show -j bqjob_r1a2b3c4_0001', 'Detail job: status, byte diproses, slot, error.'),
    q('bq-view', 'Create view `sales.big_orders` from a standard SQL query', 'bq mk --use_legacy_sql=false --view=<SQL> {ace-lab-123:sales.big_orders|sales.big_orders}', 'View menyimpan query, bukan data. Pemakainya butuh akses ke tabel sumber, kecuali view-nya diotorisasi (authorized view).', {
      display: "bq mk --use_legacy_sql=false --view='SELECT * FROM sales.orders WHERE total > 100' sales.big_orders"
    })
  ]
};

const build: CmdSection = {
  id: 'build',
  title: 'Terraform dan Docker',
  level: 'Menengah',
  summary: 'init, plan, apply, state, import, workspace; build, tag, push, run, exec dan compose.',
  topics: ['Terraform', 'Docker', 'Artifact Registry'],
  intro: `Folder ini berisi konfigurasi Terraform dan sebuah Dockerfile. Repository image: \`${IMG}\`.`,
  items: [
    q('tf-init', 'Download the providers and set up the backend for this folder', 'terraform init', 'Wajib sekali per folder, dan diulang saat provider, modul, atau backend berubah.'),
    q('tf-fmt', 'Reformat the .tf files to the standard style', 'terraform fmt', '`-check` hanya memeriksa tanpa mengubah — cocok untuk CI.'),
    q('tf-validate', 'Check that the configuration is valid', 'terraform validate', 'Memeriksa sintaks dan referensi tanpa menghubungi cloud.'),
    q('tf-plan', 'Show what would change, without changing anything', 'terraform plan', 'Plan membandingkan konfigurasi dengan state dan kondisi nyata, lalu mencetak + create, ~ update, - destroy.'),
    q('tf-plan-out', 'Save the plan to the file `tfplan`', 'terraform plan -out=tfplan', 'File plan menjamin apply menjalankan persis yang sudah ditinjau.'),
    q('tf-apply-plan', 'Apply exactly the saved plan `tfplan`', 'terraform apply tfplan', 'Apply dengan file plan tidak bertanya lagi dan tidak menerima -var.'),
    q('tf-auto', 'Apply without the yes prompt, for a CI pipeline', 'terraform apply -auto-approve', 'Tanpa -auto-approve, Terraform hanya menerima jawaban persis `yes`.'),
    q('tf-var', 'Plan with variable `region` set to `us-central1`', 'terraform plan -var=region=us-central1', 'Bisa ditulis `-var="region=us-central1"` atau `-var \'region=us-central1\'`.'),
    q('tf-varfile', 'Plan with the variables in `prod.tfvars`', 'terraform plan -var-file=prod.tfvars', 'File terraform.tfvars dan *.auto.tfvars dibaca otomatis; file lain lewat -var-file.'),
    q('tf-target', 'Apply only the resource `google_compute_instance.web`', 'terraform apply -target=google_compute_instance.web', 'Hanya untuk keadaan darurat — membiarkan sisa konfigurasi tidak sinkron.'),
    q('tf-state-list', 'List the resources Terraform manages', 'terraform state list', 'Satu alamat resource per baris, seperti google_storage_bucket.assets.'),
    q('tf-state-show', 'Show the recorded state of `google_storage_bucket.assets`', 'terraform state show google_storage_bucket.assets', 'Menampilkan atribut resource seperti yang tersimpan di state.'),
    q('tf-import', 'Bring the existing bucket `ace-assets-123` under the resource `google_storage_bucket.assets`', 'terraform import google_storage_bucket.assets ace-assets-123', 'Urutannya ADDRESS lalu ID. Blok resource-nya harus sudah ditulis di konfigurasi.', {
      traps: [{ when: /^terraform import ace-assets-123\b/, say: 'Urutannya terbalik: alamat resource dulu, baru ID-nya.' }]
    }),
    q('tf-output', 'Print the output values', 'terraform output', '`-raw NAMA` mencetak satu nilai tanpa tanda kutip, cocok untuk skrip.'),
    q('tf-ws', 'Create and switch to workspace `dev`', 'terraform workspace new dev', 'Workspace memisahkan state untuk konfigurasi yang sama. Di backend gcs, state-nya menjadi PREFIX/dev.tfstate.', {
      traps: [{ when: /^terraform workspace create/, say: 'Subcommand-nya `new`, bukan create.' }]
    }),
    q('tf-destroy', 'Remove everything this configuration built', 'terraform destroy', 'Sama dengan `terraform apply -destroy`; meminta jawaban `yes`.'),
    q('dk-build', `Build the Dockerfile in this folder as \`${IMG}/web:v1\``, `docker build -t ${IMG}/web:v1 .`, 'Titik di akhir adalah build context. Tanpa itu docker menolak perintahnya.', {
      traps: [{ when: /^docker build -t \S+$/, say: 'Build context belum ada: tambahkan `.` di akhir.' }]
    }),
    q('dk-push', 'Push that image to Artifact Registry', `docker push ${IMG}/web:v1`, 'Sebelumnya: `gcloud auth configure-docker us-central1-docker.pkg.dev` dan role `artifactregistry.writer`. Repository-nya harus sudah dibuat.'),
    q('dk-tag', `Give the local image \`web:v1\` the name \`${IMG}/web:v1\``, `docker tag web:v1 ${IMG}/web:v1`, 'Tag hanya menambah nama baru untuk image yang sama; urutannya SUMBER lalu TUJUAN.'),
    q('dk-run', 'Run `nginx` in the background as container `web`, mapping host port 8080 to container port 80', 'docker run -d -p 8080:80 --name web nginx', 'Flag ditulis sebelum nama image — apa pun setelah image dianggap perintah untuk container. Port ditulis HOST:CONTAINER.', {
      traps: [
        { when: /-p\s*80:8080|--publish[= ]80:8080/, say: 'Urutan port HOST:CONTAINER — host 8080, container 80: `-p 8080:80`.' },
        { when: /docker run .*\bnginx\s+-/, say: 'Flag setelah nama image dianggap perintah untuk container. Taruh semua flag sebelum `nginx`.' }
      ]
    }),
    q('dk-env', 'Run `app:v1` with the environment variable `ENV=prod`', 'docker run -e ENV=prod app:v1', '`-e` boleh diulang untuk beberapa variabel, atau pakai `--env-file`.'),
    q('dk-ps', 'List all containers, including stopped ones', ['docker ps -a', 'docker container ls -a'], 'Tanpa `-a`, hanya container yang sedang jalan.'),
    q('dk-logs', 'Follow the logs of container `web`', 'docker logs -f web', '`--tail=100` membatasi baris awal yang ditampilkan.'),
    q('dk-exec', 'Open a shell in the running container `web`', 'docker exec -it web {sh|bash|/bin/sh|/bin/bash}', 'Berbeda dengan kubectl, docker exec tidak memakai `--` sebelum perintahnya.'),
    q('dk-stop', 'Stop container `web`', 'docker stop web', 'Mengirim SIGTERM lalu SIGKILL setelah 10 detik.'),
    q('dk-rm', 'Remove container `web`', 'docker rm web', 'Container harus berhenti dulu, atau pakai `-f`.'),
    q('dk-images', 'List the local images', 'docker images', 'Sama dengan `docker image ls`.'),
    q('dk-compose', 'Start the multi-container app defined in `compose.yaml`, in the background', 'docker compose up -d', 'Compose v2 adalah subcommand `docker compose`; `docker-compose` dengan tanda hubung adalah nama lama.'),
    q('dk-pull', 'Download the image `nginx:1.27`', 'docker pull nginx:1.27', 'Tanpa tag, docker menarik `latest`.')
  ]
};

export const CMD_SECTIONS: CmdSection[] = [start, auth, compute, network, lb, gke, serverless, messaging, ops, kubeLook, kubeDeploy, storage, bigquery, build];

export const MIX_ID = 'mix';
export const MIX_SIZE = 20;

/** The mixed paper: drawn fresh each sitting from every section. */
export const MIX_META: CmdSection = {
  id: MIX_ID,
  title: 'Campuran semua bagian',
  level: 'Lanjut',
  summary: `${MIX_SIZE} soal acak dari semua bagian — gaya ujian, tanpa tahu dulu alat mana yang dipakai.`,
  topics: ['Semua alat'],
  intro: `Project \`ace-lab-123\`, compute/region \`us-central1\`, compute/zone \`us-central1-a\`. Soal diambil acak dari semua bagian; tiap soal menyebut sendiri nama yang dipakai.`,
  items: []
};

export const ALL_ITEMS: CmdItem[] = CMD_SECTIONS.flatMap((s) => s.items);
export const ITEM_BY_ID: Record<string, CmdItem> = Object.fromEntries(ALL_ITEMS.map((i) => [i.id, i]));
export const SECTION_OF: Record<string, CmdSection> = Object.fromEntries(CMD_SECTIONS.flatMap((s) => s.items.map((i) => [i.id, s])));
export const CMD_BY_ID: Record<string, CmdSection> = Object.fromEntries([...CMD_SECTIONS, MIX_META].map((s) => [s.id, s]));
export const CMD_LIST: CmdSection[] = [...CMD_SECTIONS, MIX_META];

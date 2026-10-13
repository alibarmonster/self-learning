"""
One-off: replace the options/answer of CDL questions with balanced sets where
every option is written in the same register and length, and the distractors
are near-misses (neighbouring product, swapped concept, half-true statement).
Prompts and explanations are kept; a few explanations get a short addendum.
Run from the project root: python3 scripts/tools/rebalance-options.py
"""
import re, pathlib

R = {}  # id -> (options, answer)

# ── Digital transformation ──────────────────────────────────────────────────
R['dt-01'] = ([
  'Migrating an organisation\'s existing servers and applications to a cloud provider so that IT costs fall.',
  'Using digital technology to fundamentally change how an organisation operates and delivers value to customers.',
  'Digitising an organisation\'s paper records and manual forms so that its existing processes run faster.',
  'Appointing a chief digital officer to own the organisation\'s technology roadmap and vendor relationships.'
], 1)
R['dt-02'] = ([
  'Rising capital expenditure, because on-premises hardware has to be replaced sooner.',
  'Loss of agility and slower time to market, because releases depend on slow infrastructure change.',
  'Vendor lock-in, because the competitors are now tied to a single cloud provider.',
  'Reduced data sovereignty, because customer data now leaves the retailer\'s own data centre.'
], 1)
R['dt-03'] = ([
  'It has been rehosted onto cloud virtual machines with its original architecture kept intact.',
  'It is designed from the start to use elasticity, managed services, containers and microservices.',
  'It was written using a cloud provider\'s SDK so it can call that provider\'s services directly.',
  'It runs in a single large virtual machine so that it can be moved between clouds easily.'
], 1)
R['dt-04'] = ([
  'Open source is code anyone may use and modify; an open standard is a public specification anyone may implement.',
  'Open source is a public specification anyone may implement; an open standard is code anyone may use and modify.',
  'Open source is software licensed free of charge; an open standard is software licensed under a paid agreement.',
  'Open source is maintained by a single vendor; an open standard is maintained jointly by several vendors.'
], 0)
R['dt-06'] = ([
  'Data cloud, open infrastructure cloud, collaboration cloud, trusted cloud, and sustainability.',
  'Data cloud, serverless cloud, collaboration cloud, secure cloud, and cost optimisation.',
  'Analytics cloud, hybrid cloud, productivity cloud, compliance cloud, and sustainability.',
  'Data cloud, open infrastructure cloud, application cloud, identity cloud, and resilience.'
], 0)
R['dt-07'] = ([
  'Changing customer expectations for fast, personalised digital experiences.',
  'A preference for keeping data and applications in a single on-premises data centre.',
  'Competitive pressure from digitally native rivals that ship faster.',
  'A need to add more manual approval steps to the software release process.'
], [0, 2])
R['dt-08'] = ([
  'Spending shifts from large up-front purchases of hardware to ongoing pay-as-you-go operating costs.',
  'Spending shifts from ongoing operating costs to large up-front investment in owned data centres.',
  'Spending shifts from the IT department\'s budget to each business unit\'s own operating budget.',
  'Spending shifts from hardware depreciation over five years to depreciation over a single year.'
], 0)
R['dt-09'] = ([
  'Scalability is handling more load by adding resources; elasticity is adding and removing them automatically as demand changes.',
  'Scalability is adding and removing resources automatically as demand changes; elasticity is handling more load by adding resources.',
  'Scalability applies to storage capacity growing over time; elasticity applies to compute capacity growing over time.',
  'Scalability is a property of cloud systems; elasticity is the same property when measured for on-premises systems.'
], 0)
R['dt-10'] = ([
  'TCO counts the purchase price of hardware plus its depreciation over the accounting period.',
  'TCO includes the full cost of running a system over its life: hardware, software, facilities, power, staff and maintenance.',
  'TCO compares the monthly cloud bill against the monthly cost of leasing equivalent hardware.',
  'TCO includes hardware, software and support contracts, but excludes staff and facility costs.'
], 1)
R['dt-11'] = ([
  'A region is a geographic location made up of several zones, each an isolated deployment area within it.',
  'A zone is a geographic location made up of several regions, each an isolated deployment area within it.',
  'A region is a continent and a zone is a country within it; resources are placed at the country level.',
  'A region and a zone are the same physical data centre, addressed at different levels of the API.'
], 0)
R['dt-12'] = ([
  'The amount of data that can be moved across a connection per second.',
  'The time it takes for data to travel from its source to its destination.',
  'The number of network hops between a user and the nearest region.',
  'The delay added when data is encrypted before it leaves a region.'
], 1)
R['dt-13'] = ([
  'To keep customer traffic on Google\'s own network for longer, reducing latency and improving reliability.',
  'To keep customer traffic inside a single country so that data residency requirements are met by default.',
  'To offer customers a cheaper internet connection than local ISPs provide in each region.',
  'To avoid the need for multiple regions by serving every customer from one central location.'
], 0)
R['dt-16'] = ([
  'You pay only for the resources you actually use, instead of for capacity bought in advance.',
  'The provider takes over responsibility for all of your security obligations, including access control.',
  'Capacity can be added or removed in minutes rather than in the months a hardware order takes.',
  'Data governance becomes unnecessary because the provider classifies and manages your data.'
], [0, 2])
R['dt-19'] = ([
  'Patching the operating system of the servers that run Gmail and Drive.',
  'Controlling the physical access to the data centres that host the service.',
  'Deciding who in the company can access which documents, and protecting user credentials.',
  'Replacing failed storage hardware so that mailboxes remain available.'
], 2)
R['dt-20'] = ([
  'IaaS needs the most in-house expertise but gives the most flexibility; SaaS needs the least but allows the least customisation.',
  'IaaS needs the least in-house expertise but gives the most flexibility; SaaS needs the most but allows the least customisation.',
  'IaaS gives the provider control of the operating system; SaaS gives the customer control of the operating system.',
  'IaaS is billed per user per month; SaaS is billed for the underlying compute and storage consumed.'
], 0)
R['dt-22'] = ([
  'Physical security of the data centre and the servers on which the VMs are hosted.',
  'Patching the guest operating system and securing the application running on the VM.',
  'Maintaining the hypervisor and the virtualisation layer that isolates the VMs.',
  'Replacing failed disks and network switches beneath the VMs without downtime.'
], 1)
R['dt-23'] = ([
  'The hardware is a sunk cost, so the comparison should only include the cloud bill against future hardware purchases.',
  'The hardware price is only part of TCO; power, cooling, space, staff, refresh cycles and idle capacity continue every month.',
  'Cloud is cheaper in every scenario because providers buy hardware at scale, so the data centre should be closed now.',
  'Cloud removes the need for most IT staff, so the saving comes mainly from a smaller operations team.'
], 1)
R['dt-24'] = ([
  'Run the application in a single zone on larger, more reliable virtual machines.',
  'Deploy the application across multiple zones within a single region.',
  'Deploy the application in one zone and keep nightly backups in a second region.',
  'Run the application in a single zone behind a global load balancer.'
], 1)
R['dt-25'] = ([
  'Elasticity: capacity scales up for the sale and back down afterwards, so spend follows demand instead of peak provisioning.',
  'Scalability: capacity is provisioned for the largest expected sale, so spend is fixed and predictable across the year.',
  'High availability: capacity is duplicated across zones, so spend doubles but the sale never fails.',
  'Committed use: capacity is reserved for three years at a discount, so spend is lower than on-demand pricing.'
], 0)
R['dt-26'] = ([
  'The customer: on IaaS the guest OS is theirs to patch; a PaaS or serverless option would make the runtime Google\'s responsibility.',
  'Google: on IaaS the provider patches the guest OS; only on a bare-metal option would patching become the customer\'s job.',
  'The customer: on every service model the customer patches the OS, so moving to PaaS would not change the responsibility.',
  'Shared equally: Google patches the OS on alternate months and the customer patches it in between.'
], 0)
R['dt-27'] = ([
  'Agility: managed services, automation and elastic infrastructure let teams release small changes often and respond to the market.',
  'Cost: cloud pricing is lower than the bank\'s data centre, so the savings can fund a larger development team.',
  'Security: the provider takes over the bank\'s security obligations, freeing the security team to work on the app.',
  'Compliance: the provider\'s certifications transfer to the bank, shortening the regulatory review before each release.'
], 0)
R['dt-28'] = ([
  'Latency from distance: deploy in regions close to users and route each user to the nearest with a global load balancer.',
  'Bandwidth: the US region\'s connection is saturated, so a larger network tier in that region will fix the page loads.',
  'Capacity: the US VMs are too small for the traffic, so larger machine types in that region will fix the page loads.',
  'Availability: the US region has a single zone, so a multi-zone deployment there will fix the page loads.'
], 0)
R['dt-29'] = ([
  'SaaS: subscribe to Google Workspace and use the tools.',
  'PaaS: deploy open-source mail and file servers on App Engine.',
  'IaaS: run the mail and file servers on Compute Engine VMs.',
  'Hybrid: keep the servers in the office and add cloud backups.'
], 0)
R['dt-30'] = ([
  'Power, cooling, floor space and the staff time to maintain and eventually replace the hardware.',
  'The cost of over-provisioning: hardware sized for peak demand that sits idle most of the time.',
  'The cloud provider\'s data egress charges, which apply to on-premises traffic as well.',
  'The licence fees for the operating system, which are only charged on-premises.'
], [0, 1])

# ── Data ────────────────────────────────────────────────────────────────────
R['data-01'] = ([
  'A database holds current transactional data; a warehouse holds structured historical data for analysis; a lake holds raw data of any type.',
  'A database holds raw data of any type; a warehouse holds current transactional data; a lake holds structured historical data for analysis.',
  'A database holds structured historical data for analysis; a warehouse holds raw data of any type; a lake holds current transactional data.',
  'A database holds structured data; a warehouse holds the same data compressed for storage; a lake holds the backups of both.'
], 0)
R['data-02'] = ([
  'A table of customer orders with columns for id, date and amount.',
  'A spreadsheet of monthly sales figures by store and product.',
  'A collection of recorded customer support calls in audio form.',
  'A list of product SKUs with their prices and stock levels.'
], 2)
R['data-03'] = ([
  'It makes queries run faster by indexing the most frequently accessed tables.',
  'It ensures data is accurate, consistent, secure, properly classified and used in line with policy.',
  'It reduces storage cost by deleting data that has not been queried for a set period.',
  'It replaces the need for backups by keeping a versioned copy of every table.'
], 1)
R['data-04'] = ([
  'Make better use of the data the organisation already holds.',
  'Delete historical data once it is older than the current reporting period.',
  'Bring in external data sources to enrich the organisation\'s own.',
  'Restrict data access to the IT department to keep it consistent.'
], [0, 2])
R['data-05'] = ([
  'Batch analytics run every night on the day\'s completed journeys.',
  'Streaming analytics on road and vehicle events as they arrive.',
  'Predictive analytics on last year\'s traffic patterns by season.',
  'Descriptive analytics on a dashboard refreshed every hour.'
], 1)
R['data-06'] = ([
  'The steps that turn raw data into business value: collecting, storing, processing, analysing and acting on it.',
  'The steps that move data between systems: extracting, transforming, loading, archiving and deleting it.',
  'The steps that price a dataset for sale: sourcing, cleaning, licensing, packaging and distributing it.',
  'The steps that secure data: classifying, encrypting, backing up, auditing and retiring it.'
], 0)
R['data-07'] = ([
  'A managed relational database for transactional web and mobile applications.',
  'A serverless, fully managed data warehouse for analysing very large datasets with SQL.',
  'A managed NoSQL wide-column store for high-throughput analytical workloads.',
  'A managed data lake service for storing raw files and querying them with Spark.'
], 1)
R['data-12'] = (['Cloud SQL', 'Bigtable', 'Firestore', 'Cloud Spanner'], 1)
R['data-14'] = (['Cloud SQL', 'Cloud Storage', 'Filestore', 'Firestore'], 1)
R['data-15'] = ([
  'Relational databases use fixed-schema tables and support joins; NoSQL databases use flexible models and scale out more easily.',
  'Relational databases use flexible models and scale out more easily; NoSQL databases use fixed-schema tables and support joins.',
  'Relational databases store structured text and numbers; NoSQL databases store only unstructured files and media.',
  'Relational databases run on managed cloud services; NoSQL databases run only on self-managed clusters.'
], 0)
R['data-16'] = ([
  'Use Database Migration Service to replicate the database continuously into Cloud SQL, then cut over.',
  'Use Storage Transfer Service to copy the database files into Cloud Storage, then import them into Cloud SQL.',
  'Use Dataflow to stream the tables into BigQuery, then point the application at BigQuery.',
  'Use Database Migration Service to convert the schema for Spanner, then rewrite the queries.'
], 0)
R['data-17'] = (['Cloud SQL', 'Bigtable', 'Cloud Spanner', 'Firestore'], [0, 2])
R['data-18'] = ([
  'BigQuery Omni lets you analyse data stored in AWS and Azure with BigQuery without moving it.',
  'BigQuery replicates every table automatically into AWS and Azure so queries run in any cloud.',
  'BigQuery is licensed to AWS and Azure, which sell it under their own product names.',
  'BigQuery can import data from AWS and Azure into Google Cloud on a nightly schedule.'
], 0)
R['data-19'] = ([
  'A business intelligence platform where users explore data and build dashboards on a governed semantic model.',
  'A data preparation tool where analysts clean and join raw files before loading them into a warehouse.',
  'A managed notebook environment where data scientists train and evaluate machine learning models.',
  'A data catalogue where stewards tag tables with owners, sensitivity levels and retention rules.'
], 0)
R['data-20'] = ([
  'Cloud Storage and Dataproc',
  'Pub/Sub and Dataflow',
  'Pub/Sub and Dataprep',
  'Cloud SQL and Data Fusion'
], 1)
R['data-21'] = (['Looker Studio', 'Looker', 'Dataflow', 'Cloud Monitoring'], 1)
R['data-22'] = ([
  'It stores event data in tables so that it can be analysed later with SQL.',
  'It is an asynchronous messaging service that decouples event producers from consumers.',
  'It transforms events in flight by applying windowing and enrichment logic.',
  'It schedules pipeline runs and retries the steps that fail.'
], 1)
R['data-23'] = ([
  'It is cheaper than batch processing because data is handled in small pieces rather than large files.',
  'It lets an organisation react to events within seconds: catching fraud, adjusting prices, alerting on failures.',
  'It removes the need for a data warehouse because results are computed before the data is stored.',
  'It works on unstructured data, which batch processing cannot read.'
], 1)
R['data-24'] = ([
  'Looker is the enterprise BI platform with a governed semantic model; Looker Studio is the lighter, free self-serve reporting tool.',
  'Looker is the lighter, free self-serve reporting tool; Looker Studio is the enterprise BI platform with a governed semantic model.',
  'Looker is for dashboards on BigQuery only; Looker Studio connects to any data source including spreadsheets.',
  'Looker is the on-premises edition; Looker Studio is the same product delivered as a cloud service.'
], 0)
R['data-25'] = ([
  'Train a demand-forecasting model on the spreadsheets directly in Vertex AI.',
  'Consolidate the data into a central, governed store such as BigQuery so it can be cleaned, queried and shared.',
  'Build a Looker Studio dashboard connected to each spreadsheet so managers can see the history.',
  'Upload the spreadsheets to Cloud Storage Archive so they are preserved for future analysis.'
], 1)
R['data-28'] = (['Cloud SQL', 'Cloud Spanner', 'AlloyDB', 'BigQuery'], 0)
R['data-29'] = (['Cloud SQL', 'Cloud Spanner', 'Bigtable', 'Firestore'], 1)
R['data-30'] = (['Bigtable', 'Cloud SQL', 'Firestore', 'Cloud Spanner'], 0)
R['data-31'] = (['Looker', 'Looker Studio', 'BigQuery BI Engine', 'Dataplex'], 0)

# ── AI ──────────────────────────────────────────────────────────────────────
R['ai-01'] = ([
  'ML is a subset of AI: AI is the broad goal of human-like intelligence, and ML is the approach where systems learn from data.',
  'AI is a subset of ML: ML is the broad goal of human-like intelligence, and AI is the approach where systems learn from data.',
  'AI and ML are separate fields: AI covers rule-based expert systems, and ML covers statistical models trained on data.',
  'AI and ML are the same field: the term AI is used for research and ML for the same techniques in production.'
], 0)
R['ai-02'] = ([
  'BI describes and explains what has happened; ML learns from data to predict or decide for new, unseen cases.',
  'BI learns from data to predict or decide for new, unseen cases; ML describes and explains what has happened.',
  'BI works on structured data in warehouses; ML works only on unstructured data such as images and text.',
  'BI needs a large historical dataset; ML can work with a handful of examples and no history.'
], 0)
R['ai-03'] = ([
  'Clustering: grouping subscribers with similar usage into segments.',
  'Classification: predicting a category such as will churn or will not churn.',
  'Regression: predicting a numeric value such as months until cancellation.',
  'Anomaly detection: flagging subscribers whose usage is unusual.'
], 1)
R['ai-04'] = ([
  'A model learns whatever patterns are in its data, so inaccurate, incomplete or biased data produces an inaccurate or biased model.',
  'A model corrects for errors in its data during training, so quality matters less than the quantity of examples provided.',
  'A model trained on high-quality data needs less compute, so data quality mainly affects training cost and speed.',
  'A model\'s accuracy depends on its architecture, so data quality mainly affects how long training takes to converge.'
], 0)
R['ai-05'] = ([
  'The ability to understand and describe why a model produced a particular prediction, so humans can trust and check it.',
  'The ability of a model to explain the task it was trained for in plain language when queried by a user.',
  'The requirement that a model\'s training data and code are published so that anyone can reproduce it.',
  'The property of a model that its predictions are always correct, so no explanation of errors is needed.'
], 0)
R['ai-06'] = ([
  'The model was trained on too little data, so it cannot generalise to female applicants.',
  'Historical bias in the training data has been learned and reproduced by the model.',
  'The model was optimised for speed rather than accuracy, so it ignores some features.',
  'The model was trained in a region whose labour laws differ from the company\'s.'
], 1)
R['ai-07'] = ([
  'Finding patterns in datasets far too large for people to review.',
  'Removing the need for human oversight once the model is deployed.',
  'Unlocking value from unstructured data such as images, audio and text.',
  'Guaranteeing that predictions are correct when the input data is complete.'
], [0, 2])
R['ai-08'] = ([
  'Train a custom image model in Vertex AI using their product photos.',
  'Use a pre-trained API such as the Vision API.',
  'Use AutoML in Vertex AI with a small set of labelled photos.',
  'Use BigQuery ML on the product catalogue data.'
], 1)
R['ai-09'] = ([
  'The pre-trained Vision API, with the defect categories passed as parameters.',
  'AutoML in Vertex AI, trained on its own labelled images without writing model code.',
  'A custom model in Vertex AI, written in TensorFlow by a contracted data scientist.',
  'BigQuery ML, with the photos loaded into a table as binary columns.'
], 1)
R['ai-10'] = ([
  'The speed of deployment and the effort required.',
  'The programming language the model will be written in.',
  'The differentiation the solution provides and the in-house expertise available.',
  'The region in which the model will be served.'
], [0, 2])
R['ai-11'] = ([
  'The problem is unique to the business and the model itself is a competitive differentiator.',
  'The task is generic, such as translating text, but the company wants full ownership of the code.',
  'No pre-trained model covers the data type or domain, and the company has ML expertise.',
  'The company needs a result this week and has a small labelled dataset ready.'
], [0, 2])
R['ai-12'] = ([
  'They are trained by the customer on Google\'s infrastructure and then called through a managed endpoint.',
  'They are trained by Google on large datasets and can be called immediately for common tasks.',
  'They are trained by Google and then fine-tuned automatically on each customer\'s first thousand requests.',
  'They are trained by Google and must be retrained by the customer each time the underlying data changes.'
], 1)
R['ai-13'] = ([
  'Create and run machine learning models using standard SQL directly inside BigQuery.',
  'Export BigQuery tables to Vertex AI notebooks and train models in Python there.',
  'Call pre-trained Vision and Natural Language models on data stored in BigQuery.',
  'Schedule BigQuery queries so that model features are refreshed every night.'
], 0)
R['ai-18'] = ([
  'Google Cloud\'s unified platform for building, training, deploying and managing ML models, from AutoML to custom training.',
  'Google Cloud\'s collection of pre-trained APIs for vision, speech, language and translation tasks.',
  'Google Cloud\'s managed notebook service for exploring data and prototyping models in Python.',
  'Google Cloud\'s hardware accelerator family for training very large deep learning models.'
], 0)
R['ai-19'] = ([
  'TensorFlow is an open source ML framework created by Google; Cloud TPUs are Google-designed hardware accelerators for ML.',
  'TensorFlow is Google-designed hardware for ML; Cloud TPUs are the open source framework that runs on it.',
  'TensorFlow is a managed training service in Vertex AI; Cloud TPUs are the notebooks used to write the training code.',
  'TensorFlow is a proprietary Google framework; Cloud TPUs are commodity GPUs rented by the hour.'
], 0)
R['ai-20'] = ([
  'The model learns the specifics of your products, customers or documents, so its predictions are more accurate and more differentiating.',
  'The model trains faster on your data than on Google\'s, so it can be deployed sooner than a pre-trained API.',
  'The model needs no labelled data because it learns the categories from your files automatically.',
  'The model runs inside your own project without any network access, so it costs nothing to serve.'
], 0)
R['ai-21'] = ([
  'The fastest available model so that customers get an approval decision immediately.',
  'Explainable AI features that attribute each prediction to its inputs, plus monitoring for bias.',
  'A larger training set so that the model\'s overall accuracy satisfies the regulator.',
  'A rule that every model decision is automatically final so that outcomes are consistent.'
], 1)
R['ai-22'] = ([
  'Custom training of a large language model on Cloud TPUs.',
  'Generative AI models such as Gemini through Vertex AI, used as a managed foundation model.',
  'AutoML text classification in Vertex AI trained on past product descriptions.',
  'The Natural Language API called on the existing product descriptions.'
], 1)
R['ai-23'] = ([
  'Classification: predicting whether each product will sell out.',
  'Regression: predicting a numeric quantity such as units sold.',
  'Clustering: grouping products with similar sales patterns.',
  'Recommendation: predicting which products a shopper will buy.'
], 1)
R['ai-24'] = (['Document AI', 'Natural Language API', 'Vision API', 'AutoML Tables'], 0)
R['ai-25'] = ([
  'Speech-to-Text to transcribe the calls, then the Natural Language API for sentiment and entities.',
  'Speech-to-Text to transcribe the calls, then a custom sentiment model trained on Vertex AI.',
  'The Natural Language API on the call recordings directly, since it accepts audio input.',
  'Text-to-Speech to normalise the recordings, then the Natural Language API for sentiment.'
], 0)
R['ai-26'] = ([
  'AutoML image classification in Vertex AI, trained on the tagged photos.',
  'The pre-trained Vision API with the internal categories added as labels.',
  'A custom convolutional network built by a contracted data scientist.',
  'The Vision API for labels, mapped to internal categories with a lookup table.'
], 0)
R['ai-27'] = (['BigQuery ML', 'AutoML Tables in Vertex AI', 'Custom TensorFlow on Cloud TPUs', 'Looker forecasting'], 0)
R['ai-28'] = ([
  'Explainability tooling that attributes each prediction to its input features.',
  'A retraining schedule so the model always uses the most recent applications.',
  'Bias evaluation of the training data and ongoing monitoring of outcomes by group.',
  'A larger training set so that every postcode has enough examples.'
], [0, 2])
R['ai-29'] = ([
  'A Gemini foundation model through Vertex AI, grounded on its own documents, under Google Cloud\'s data-use terms.',
  'A large language model trained from scratch on its own documents using Cloud TPUs.',
  'AutoML text classification in Vertex AI trained on labelled clauses from past contracts.',
  'The Natural Language API for entity extraction, with templates for drafting.'
], 0)
R['ai-30'] = (['Document AI', 'Vision API OCR with custom parsing', 'Natural Language API', 'Dataprep'], 0)

# ── Infrastructure ──────────────────────────────────────────────────────────
R['infra-01'] = ([
  'Moving an application to the cloud largely as-is, typically onto virtual machines, without changing its code.',
  'Moving an application to the cloud while swapping its database for a managed service such as Cloud SQL.',
  'Moving an application to the cloud by rebuilding it as containers before the migration begins.',
  'Moving an application\'s data to the cloud while the application itself stays on-premises.'
], 0)
R['infra-02'] = ([
  'Rehost: move the application as-is onto virtual machines.',
  'Replatform: move the application with modest changes to use managed services.',
  'Refactor: rebuild the application as containers and microservices.',
  'Reimagine: redesign the business process and build a new application.'
], 1)
R['infra-03'] = ([
  'Refactor rearchitects an existing application to be cloud-native; reimagine rethinks the business process and builds something new.',
  'Refactor rethinks the business process and builds something new; reimagine rearchitects an existing application to be cloud-native.',
  'Refactor changes the application\'s code; reimagine changes only the infrastructure it runs on.',
  'Refactor is done before migration; reimagine is done after the application is already in the cloud.'
], 0)
R['infra-05'] = ([
  'A physical server in a Google data centre reserved for a single customer\'s exclusive use.',
  'A software emulation of a computer, with its own operating system, running on shared physical hardware.',
  'A packaged application with its dependencies that shares the host\'s operating system kernel.',
  'A managed runtime that executes application code without an operating system to maintain.'
], 1)
R['infra-06'] = ([
  'A container includes its own guest operating system; a VM shares the host kernel, so a VM is lighter.',
  'A container packages an app with its dependencies and shares the host kernel; a VM carries its own full OS.',
  'A container runs only on Kubernetes; a VM runs on any hypervisor, so a VM is more portable.',
  'A container is a snapshot of a VM\'s disk; a VM is the running instance started from that snapshot.'
], 1)
R['infra-07'] = ([
  'An application built as small, independently deployable services that communicate over APIs.',
  'An application built as a single deployable unit, split internally into modules that share a database.',
  'An application built to run on small virtual machines, so that it can be scaled by adding more of them.',
  'An application built from serverless functions, each triggered by an event rather than a request.'
], 0)
R['infra-08'] = ([
  'Kubernetes is an open source container orchestrator; GKE is Google Cloud\'s managed Kubernetes service.',
  'Kubernetes is Google Cloud\'s managed container service; GKE is the open source project it is built on.',
  'Kubernetes is a container runtime that starts and stops containers; GKE is the registry that stores their images.',
  'Kubernetes is a serverless container platform; GKE is the version that runs on customer-managed nodes.'
], 0)
R['infra-09'] = ([
  'Standard on-demand VMs, sized to the job',
  'Spot VMs, heavily discounted but reclaimable by Google at short notice',
  'Sole-tenant nodes, dedicated to the team\'s jobs',
  'VMs under a one-year committed use discount'
], 1)
R['infra-10'] = ([
  'Automatically adds or removes instances in response to load, so capacity matches demand.',
  'Automatically resizes an instance\'s CPU and memory in place as its load changes.',
  'Automatically moves instances to the region with the most spare capacity.',
  'Automatically upgrades instances to newer machine types as they are released.'
], 0)
R['infra-11'] = ([
  'Distributes incoming requests across multiple healthy instances and routes around failed ones.',
  'Adds or removes instances behind an application as the volume of incoming requests changes.',
  'Caches responses at the network edge so repeated requests never reach the instances.',
  'Inspects incoming requests and blocks those that match known attack signatures.'
], 0)
R['infra-12'] = ([
  'Portability: the same image runs on a laptop, on-premises and in any cloud.',
  'Isolation: each container includes its own operating system kernel for security.',
  'Consistency: dependencies travel with the application, so environment differences disappear.',
  'Performance: containers run faster than the same code on a virtual machine.'
], [0, 2])
R['infra-13'] = ([
  'The provider manages the servers entirely; you deploy code or containers, it scales automatically and you pay only while it runs.',
  'The provider manages the virtual machines; you deploy code onto them and pay for the machines while they are switched on.',
  'The application runs entirely in the user\'s browser, so no backend servers are needed at all.',
  'The provider runs the servers in a location you do not choose, so you cannot see or select the region.'
], 0)
R['infra-14'] = (['GKE Autopilot', 'Cloud Run', 'App Engine standard', 'Compute Engine with autoscaling'], 1)
R['infra-15'] = (['Cloud Functions', 'Cloud Run jobs', 'App Engine', 'Cloud Scheduler'], 0)
R['infra-16'] = (['Compute Engine', 'Cloud Run', 'App Engine', 'GKE Standard'], [1, 2])
R['infra-17'] = ([
  'A defined way for one piece of software to request services or data from another, without knowing its internals.',
  'A graphical interface through which administrators configure the services an application depends on.',
  'A shared database schema that two applications agree on so they can read each other\'s tables.',
  'A network rule that allows one application to reach another through a firewall.'
], 0)
R['infra-18'] = ([
  'Designing, securing, publishing, monitoring and monetising APIs: an API management platform.',
  'Building and deploying serverless APIs from source code without managing infrastructure.',
  'Discovering and cataloguing the APIs that exist across an organisation\'s projects.',
  'Load balancing API traffic across regions and protecting it from DDoS attacks.'
], 0)
R['infra-19'] = ([
  'Partners and developers can build on your services, extending your reach into new channels, and usage can be monetised.',
  'Public APIs remove the need for a sales team, because customers integrate and pay without any contact.',
  'Public APIs shift security responsibility to the partners who call them, reducing your own exposure.',
  'Public APIs let you copy a partner\'s data into your own systems, enlarging your data estate.'
], 0)
R['infra-20'] = ([
  'A platform for running and managing applications consistently across on-premises, Google Cloud and other clouds.',
  'A platform for migrating virtual machines from on-premises data centres into Compute Engine.',
  'A platform for hosting containers serverlessly, scaling to zero between requests.',
  'A platform for managing API traffic between on-premises systems and cloud services.'
], 0)
R['infra-21'] = ([
  'Some workloads must stay on-premises for regulatory, latency or legacy reasons while others benefit from public cloud.',
  'Running the same workload in two public clouds at once protects against a single provider\'s outage.',
  'Keeping a copy of every cloud workload on-premises guarantees the lowest possible total cost.',
  'Public cloud cannot run relational databases, so those must remain on-premises.'
], 0)
R['infra-22'] = ([
  'A single control plane for configuration, policy and observability across every cluster, reducing effort and inconsistency.',
  'Automatic migration of the on-premises cluster into Google Cloud so only one environment remains.',
  'A managed VPN between the two clusters so that workloads can move between them at any time.',
  'A single billing account for both clusters so that costs can be compared side by side.'
], 0)
R['infra-23'] = ([
  'Refactor the applications into containers on GKE before moving them.',
  'Rehost the VMs to Compute Engine or Google Cloud VMware Engine, then modernise selectively.',
  'Replatform each application onto Cloud Run during the move.',
  'Reimagine the applications as serverless functions before the deadline.'
], 1)
R['infra-24'] = ([
  'Applications run faster than on other platforms because the provider assigns dedicated hardware.',
  'Teams pay only for actual execution and never manage servers, so effort shifts from infrastructure to features.',
  'Applications can be deployed without a code repository, because the provider stores the source.',
  'Teams get a fixed monthly price for compute, so budgeting becomes predictable.'
], 1)
R['infra-25'] = (['Apigee', 'Cloud Endpoints', 'Cloud Armor', 'Identity-Aware Proxy'], 0)
R['infra-26'] = ([
  'Avoiding dependence on a single provider and choosing best-of-breed services from each.',
  'Reducing operational complexity, because each provider manages part of the estate.',
  'Meeting a legal requirement that critical systems be hosted by two different providers.',
  'Lowering cost, because each provider competes to host the same workload.'
], 0)
R['infra-27'] = (['GKE Autopilot', 'GKE Standard with node auto-provisioning', 'Cloud Run', 'Compute Engine with a managed instance group'], 0)
R['infra-29'] = (['Cloud Run', 'Google Kubernetes Engine', 'App Engine flexible', 'Compute Engine with autoscaling'], 0)
R['infra-30'] = ([
  'Rehost the VMs to Compute Engine now, then replatform or refactor the applications that will benefit.',
  'Replatform each application onto managed services as it moves, so nothing is migrated twice.',
  'Refactor the most critical applications first and rehost the rest after the lease ends.',
  'Retain the applications on-premises by extending the lease, then migrate when code changes are possible.'
], 0)
R['infra-31'] = (['Apigee', 'Cloud Endpoints', 'Cloud Load Balancing', 'Identity Platform'], 0)
R['infra-32'] = ([
  'A hybrid and multicloud platform such as Anthos / GKE Enterprise, managing all three environments from one control plane.',
  'A dedicated interconnect between the on-premises ledger and each cloud, with separate tooling per environment.',
  'A managed migration of the ledger into a private region inside Google Cloud to satisfy the regulator.',
  'A single public cloud for everything new, with the second cloud limited to backups.'
], 0)
R['infra-33'] = (['Spot VMs on Compute Engine', 'Committed use discounts on standard VMs', 'Cloud Run jobs', 'GKE Autopilot'], 0)

# ── Security ────────────────────────────────────────────────────────────────
R['sec-01'] = ([
  'Data is only accessible to the people and systems authorised to see it.',
  'Data cannot be altered without the change being detected.',
  'Data and systems are available whenever authorised users need them.',
  'Data is retained for the period that regulation requires.'
], 0)
R['sec-05'] = ([
  'Responsibility is shared: the provider secures the infrastructure and platform; the customer secures its data, identities and configuration.',
  'Responsibility moves to the provider: it secures the infrastructure, the platform and the customer\'s data, identities and configuration.',
  'Responsibility stays with the customer: the provider secures only the physical buildings, and the customer secures everything else.',
  'Responsibility is divided by region: the provider secures workloads in its home country and the customer secures the rest.'
], 0)
R['sec-06'] = ([
  'Security protects systems and data from threats; privacy governs the appropriate collection and use of personal information.',
  'Security governs the appropriate collection and use of personal information; privacy protects systems and data from threats.',
  'Security is the technical controls an organisation applies; privacy is the legal contract it signs with its provider.',
  'Security applies to data in transit and in use; privacy applies to data at rest.'
], 0)
R['sec-07'] = ([
  'Layering multiple independent controls so that a breach of one layer does not compromise the whole.',
  'Concentrating investment in the strongest possible perimeter so that attackers never reach the interior.',
  'Encrypting data with multiple algorithms in sequence so that breaking one leaves the data protected.',
  'Placing data centres deep underground so that physical access is impossible without detection.'
], 0)
R['sec-08'] = ([
  'At rest, in transit, and in use.',
  'At rest, in transit, and in backup.',
  'On disk, in memory, and in the browser.',
  'In the region, between regions, and at the edge.'
], 0)
R['sec-09'] = ([
  'It is enabled by default for all customer data, with the option to manage your own keys.',
  'It is enabled by default for databases only; object storage requires customer-managed keys.',
  'It is available on request and enabled per project by the customer\'s administrator.',
  'It is enabled by default, but only when the customer supplies its own encryption keys.'
], 0)
R['sec-10'] = ([
  'Authentication proves who you are; authorisation decides what you may do; auditing records what was done.',
  'Authentication decides what you may do; authorisation proves who you are; auditing records what was done.',
  'Authentication proves who you are; authorisation records what was done; auditing decides what you may do.',
  'Authentication records what was done; authorisation proves who you are; auditing decides what you may do.'
], 0)
R['sec-11'] = ([
  'Even if a password is stolen, an attacker still needs a second factor to sign in.',
  'Passwords are no longer needed, because the second factor replaces them entirely.',
  'Passwords are checked twice, so a mistyped password is caught before login.',
  'Sign-in is faster, because the second factor is remembered on the device.'
], 0)
R['sec-12'] = ([
  'Define who has what access to which resource, following the principle of least privilege.',
  'Define which networks can reach which resource, following the principle of segmentation.',
  'Define which encryption keys protect which resource, following the principle of key rotation.',
  'Define which users are billed for which resource, following the principle of chargeback.'
], 0)
R['sec-13'] = (['Cloud Armor', 'Cloud NAT', 'Identity-Aware Proxy', 'VPC Service Controls'], 0)
R['sec-14'] = ([
  'The people, processes and tools that continuously monitor, detect, investigate and respond to threats.',
  'The team that writes security policies and audits the organisation against them once a year.',
  'The set of encryption, key management and access controls that prevent threats from succeeding.',
  'The backup and disaster recovery schedule that restores systems after a security incident.'
], 0)
R['sec-15'] = ([
  'Custom-designed server hardware with a Titan security chip that verifies the boot process.',
  'A requirement that customers bring their own physical servers into Google\'s data centres.',
  'Encryption of data in transit between data centres by default.',
  'A single central firewall through which all customer traffic must pass.'
], [0, 2])
R['sec-16'] = ([
  'You own your data, not Google.',
  'Google may use customer data to improve its advertising models.',
  'Google does not sell customer data to third parties.',
  'Customer data is stored in a single country chosen by Google.'
], [0, 2])
R['sec-17'] = ([
  'So customers can verify, rather than take on faith, how Google handles data requests and whether its controls meet standards.',
  'So regulators can approve each new Google Cloud region before customers are allowed to store data there.',
  'So customers can see which other organisations use Google Cloud and compare their security configurations.',
  'So Google can transfer its compliance obligations to the auditors who sign the reports.'
], 0)
R['sec-18'] = ([
  'Residency is where data is physically stored; sovereignty is data being subject to the laws of the country it is in.',
  'Residency is data being subject to the laws of the country it is in; sovereignty is where data is physically stored.',
  'Residency concerns data at rest; sovereignty concerns data in transit between countries.',
  'Residency is a customer choice of region; sovereignty is Google\'s choice of which regions to build.'
], 0)
R['sec-19'] = ([
  'The Compliance Resource Center and Compliance Reports Manager, which list certifications and provide audit reports.',
  'The Security Command Center, which scans the customer\'s projects and reports which regulations they meet.',
  'Cloud Audit Logs, which record every action Google takes and can be exported to the regulator.',
  'The Trust and Safety team, which issues a compliance certificate for each customer on request.'
], 0)
R['sec-20'] = ([
  'Enforcing strong passwords for the customer\'s users.',
  'Physical security of the data centres and the security of the underlying infrastructure and services.',
  'Deciding which of the customer\'s data should be publicly accessible.',
  'Configuring the customer\'s firewall rules and IAM roles correctly.'
], 1)
R['sec-21'] = ([
  'Accepting the provider\'s terms of service and acceptable-use policy for each product.',
  'Meeting the laws, regulations and industry standards that apply to your data and operations, and being able to demonstrate it.',
  'Configuring every service according to the provider\'s published security best practices.',
  'Keeping all software on supported versions so that known vulnerabilities are patched.'
], 1)
R['sec-22'] = ([
  'Availability, and often confidentiality if data is also stolen; the defence is layered: patching, least privilege, isolated backups.',
  'Integrity, because the files are modified; the defence is checksums and version control on every file.',
  'Confidentiality, because the attackers can read the files; the defence is stronger encryption at rest.',
  'Availability only; the defence is a faster network so that files can be restored more quickly.'
], 0)
R['sec-23'] = ([
  'Access is never granted just because a request comes from inside the network; every request is verified on identity and context.',
  'Access is granted to any request from inside the corporate network and verified only for requests from outside.',
  'Access is verified once at login, and the resulting session is trusted for all resources until it expires.',
  'Access is denied by default to everyone, and granted only after a manager approves each request manually.'
], 0)
R['sec-24'] = ([
  'Access Transparency, which logs Google staff access, and Access Approval, which requires customer approval before it.',
  'Cloud Audit Logs, which log customer staff access, and IAM, which requires customer approval before it.',
  'Access Transparency, which requires customer approval, and Access Approval, which logs the access afterwards.',
  'VPC Service Controls, which block Google staff access, and Cloud KMS, which logs key usage.'
], 0)
R['sec-25'] = (['Cloud Armor', 'Cloud Load Balancing alone', 'VPC firewall rules', 'Identity-Aware Proxy'], 0)
R['sec-26'] = ([
  'Two-step verification with security keys for all console users.',
  'Longer passwords rotated every 30 days for all console users.',
  'Login alerts sent to the security team for every console sign-in.',
  'Restricting console access to the corporate office IP range.'
], 0)
R['sec-27'] = ([
  'Least privilege: IAM roles granting only the permissions each job needs, set at the right level of the hierarchy.',
  'Separation of duties: every engineer holds the Owner role, but changes need a second engineer\'s approval.',
  'Defence in depth: keep the Owner role but require a VPN and a security key before the console can be used.',
  'Auditing: keep the Owner role but export Cloud Audit Logs so that any deletion can be traced afterwards.'
], 0)
R['sec-28'] = ([
  'Access Approval, which requires the customer\'s explicit consent before Google personnel can access its data.',
  'Access Transparency, which logs the actions Google personnel take on customer data.',
  'VPC Service Controls, which prevent data from leaving the EU regions.',
  'Cloud Audit Logs, which record the actions the insurer\'s own staff take on its data.'
], [0, 1])
R['sec-29'] = ([
  'Immutable, isolated backups in Cloud Storage that the production network cannot overwrite.',
  'Least-privilege access and patching so the initial compromise spreads less far.',
  'Encrypting the file servers at rest so that the attackers cannot read the data.',
  'A larger internet connection so that files can be restored from the cloud more quickly.'
], [0, 1])
R['sec-30'] = ([
  'The Compliance Resource Center and Compliance Reports Manager, to download Google Cloud\'s audit reports and certifications.',
  'Security Command Center, to generate a PCI DSS and ISO 27001 report on the start-up\'s own projects.',
  'A support case with Customer Care, to request that Google issue a compliance certificate for the start-up.',
  'Cloud Audit Logs exported to BigQuery, to prove to the auditor that no unauthorised access occurred.'
], 0)

# ── Operations ──────────────────────────────────────────────────────────────
R['ops-01'] = ([
  'The policies, processes and tools that give an organisation visibility, predictability and control over cloud spending.',
  'The accounting rules that determine whether cloud spending is recorded as capital or operating expenditure.',
  'The approval workflow that finance must complete before any new cloud resource can be created.',
  'The discount agreements negotiated with the provider to lower the price of committed usage.'
], 0)
R['ops-03'] = ([
  'Policies set at a folder or organisation are inherited by everything beneath, and costs can be attributed per project or folder.',
  'Policies set on a project are inherited by its folder and organisation, and costs are always billed at the organisation level.',
  'Each level has its own separate policies that do not inherit, so access can be set independently per resource.',
  'Resources are automatically encrypted at the folder level, and costs are averaged across all projects in the folder.'
], 0)
R['ops-04'] = ([
  'Nothing stops by itself: a budget sends notifications, and halting spend needs additional automation.',
  'All resources in the project are suspended until the budget is raised or the next period begins.',
  'New resources cannot be created in the project, but existing ones keep running and billing.',
  'The billing account is locked and the project\'s administrators must contact support to unlock it.'
], 0)
R['ops-05'] = ([
  'A limit on how much of a resource a project can use, protecting against runaway usage.',
  'A reserved amount of a resource that a project is guaranteed to receive at peak times.',
  'A discounted amount of a resource that a project can use before standard pricing applies.',
  'A minimum amount of a resource that a project must keep provisioned to stay supported.'
], 0)
R['ops-06'] = (['Cloud Billing reports', 'Cloud Monitoring dashboards', 'Recommender', 'Cloud Audit Logs'], 0)
R['ops-07'] = ([
  'Setting budgets with alerts and using quotas to cap accidental over-use.',
  'Granting engineers the Owner role so they can resize resources without waiting.',
  'Labelling resources by team and cost centre so spend can be attributed and reviewed.',
  'Keeping unused resources provisioned so they are ready when demand returns.'
], [0, 2])
R['ops-08'] = ([
  'Spot VMs, which are discounted because they can be reclaimed',
  'Committed use discounts for a one- or three-year usage commitment',
  'Sustained use discounts earned automatically each month',
  'Preemptible VMs on a long-running managed instance group'
], 1)
R['ops-09'] = ([
  'The service keeps running with minimal downtime by removing single points of failure through redundancy.',
  'The service can be restored from backups within an agreed time after a failure takes it down.',
  'The service can scale to many times its normal load without a drop in response time.',
  'The service is deployed in several regions so that users everywhere get low latency.'
], 0)
R['ops-10'] = ([
  'RPO is how much data loss is acceptable, in time; RTO is how quickly the service must be restored.',
  'RPO is how quickly the service must be restored; RTO is how much data loss is acceptable, in time.',
  'RPO is the point at which failover is triggered; RTO is the time the standby takes to become primary.',
  'RPO is the recovery priority of a system; RTO is the team responsible for recovering it.'
], 0)
R['ops-11'] = ([
  'Fault tolerance keeps a system running through component failures; disaster recovery restores service after a major outage.',
  'Fault tolerance restores service after a major outage; disaster recovery keeps a system running through component failures.',
  'Fault tolerance covers software failures; disaster recovery covers hardware and data-centre failures.',
  'Fault tolerance is achieved with backups; disaster recovery is achieved with redundant instances.'
], 0)
R['ops-12'] = ([
  'A culture and set of practices that bring development and operations together, using automation and shared responsibility.',
  'An organisational model in which a single operations team owns deployment for every development team.',
  'A toolset for continuous integration that replaces the operations team with automated pipelines.',
  'A contract under which operations is outsourced to the cloud provider and development stays in-house.'
], 0)
R['ops-13'] = ([
  'An SLI is a measurement; an SLO is the internal target for it; an SLA is the external commitment to customers.',
  'An SLI is the external commitment to customers; an SLO is a measurement; an SLA is the internal target for it.',
  'An SLI is the internal target; an SLO is the external commitment to customers; an SLA is a measurement.',
  'An SLI is a measurement; an SLO is the external commitment to customers; an SLA is the internal target for it.'
], 0)
R['ops-14'] = ([
  'The unreliability an SLO allows, which the team can spend on risky releases until it runs out.',
  'The money set aside each quarter to pay service credits when the SLA is missed.',
  'The number of incidents a service may have per quarter before its SLO is tightened.',
  'The share of engineering time reserved for fixing bugs rather than building features.'
], 0)
R['ops-15'] = ([
  'Blameless postmortems that focus on fixing systems rather than punishing people.',
  'Manual runbooks executed by an on-call engineer for every routine operation.',
  'Automating repetitive operational work so engineers spend time on improvement.',
  'Keeping reliability targets within the operations team so developers are not slowed down.'
], [0, 2])
R['ops-16'] = ([
  'Tiered support from Basic to Premium, with faster response times and technical account management as the tier rises.',
  'A single support level for every customer, with response times set by the severity the customer assigns.',
  'Consulting engagements in which Google engineers design and build the customer\'s architecture.',
  'A managed operations service in which Google runs the customer\'s workloads on its behalf.'
], 0)
R['ops-17'] = ([
  'The customer assigns a priority from P1 to P4, which sets the target response time; the case is worked, updated and closed.',
  'Google assigns a priority based on the affected product, which sets the target response time; the customer cannot change it.',
  'Cases are worked in the order received, and the target response time depends on the customer\'s support tier only.',
  'The customer assigns a priority, but it only affects which team receives the case, not the response time.'
], 0)
R['ops-18'] = ([
  'Google has matched 100% of its annual electricity use with renewables since 2017 and aims for 24/7 carbon-free energy by 2030.',
  'Google has run every data centre directly on renewable energy since 2017 and aims to be carbon neutral by 2030.',
  'Google has been carbon neutral since 2017 and aims to match 100% of its electricity use with renewables by 2030.',
  'Google aims to match 100% of its electricity use with renewables by 2030 and to be carbon neutral by 2040.'
], 0)
R['ops-19'] = (['Carbon Footprint', 'Cloud Billing reports', 'Active Assist recommendations', 'Cloud Monitoring'], 0)
R['ops-20'] = ([
  'Google\'s data centres are far more energy-efficient than typical enterprise facilities and use a high share of carbon-free energy.',
  'Google\'s data centres use the same energy per workload, but Google buys carbon offsets on the customer\'s behalf.',
  'Cloud servers are switched off between requests, so a workload in the cloud uses almost no electricity.',
  'Moving to the cloud only reduces impact if the customer also chooses the Archive storage class for all data.'
], 0)
R['ops-21'] = ([
  'Deploy it in a region with a higher carbon-free energy percentage, flagged in the console as low CO₂.',
  'Deploy it in the region closest to the company\'s headquarters to minimise network distance.',
  'Deploy it on the largest available machine type so that it finishes faster.',
  'Deploy it in two regions so that either can be switched off when the grid is dirty.'
], 0)
R['ops-22'] = ([
  'Environmental impact has become a business metric that customers, investors and regulators track, and cloud choices affect it.',
  'Sustainability reporting is a legal requirement in every country where Google Cloud operates a region.',
  'Sustainable regions are cheaper to run, so choosing them is primarily a cost-optimisation decision.',
  'Google requires customers to report their emissions as a condition of the cloud service agreement.'
], 0)
R['ops-23'] = ([
  'Choosing a region with a high carbon-free energy percentage.',
  'Keeping development environments running so they do not need to restart.',
  'Deleting idle resources and right-sizing over-provisioned machines.',
  'Replicating every workload to several regions to spread the load.'
], [0, 2])
R['ops-24'] = ([
  'Labels let billing data be grouped and filtered, so costs can be attributed to teams, environments or projects.',
  'Labels control which IAM roles apply to a resource, so access can be attributed to teams or environments.',
  'Labels determine which region a resource is deployed to, so latency can be tuned per environment.',
  'Labels are required to create resources, so every resource is guaranteed to have an owner recorded.'
], 0)
R['ops-25'] = (['Cloud Monitoring, Cloud Logging and Cloud Trace', 'Cloud Audit Logs and Access Transparency', 'Security Command Center', 'Cloud Billing reports'], 0)
R['ops-26'] = ([
  'Cloud Billing budgets with alerts at 50%, 90% and 100% of expected spend.',
  'Resource quotas on each project, limiting CPUs and VM counts.',
  'Committed use discounts on the 50 VMs so the same usage costs less.',
  'A single billing account for all projects so spend is visible in one place.'
], [0, 1])
R['ops-27'] = ([
  'Set an internal SLO tighter than the SLA, such as 99.99%, and manage releases against the resulting error budget.',
  'Set the internal SLO equal to the SLA and add a second SLA with customers at 99.99% for premium accounts.',
  'Set an internal SLO looser than the SLA, such as 99.9%, so the team has room to release more often.',
  'Replace the availability SLO with a latency SLO, since availability is already covered by the SLA.'
], 0)
R['ops-28'] = ([
  'Both are missed: nightly backups give an RPO of up to 24 hours, and a 6-hour rebuild far exceeds a 30-minute RTO.',
  'Only the RTO is missed: nightly backups satisfy a 5-minute RPO, but a 6-hour rebuild exceeds a 30-minute RTO.',
  'Only the RPO is missed: nightly backups exceed a 5-minute RPO, but a 6-hour rebuild is within a 30-minute RTO.',
  'Neither is missed: nightly backups and a 6-hour rebuild are within both objectives for a booking system.'
], 0)
R['ops-29'] = ([
  'A blameless postmortem: focus on systemic causes and fixes, because blame drives people to hide problems.',
  'A root-cause review that identifies the engineer responsible, so the same person cannot repeat the error.',
  'A change freeze for the rest of the year, so no further releases can cause an outage.',
  'An external audit of the engineering team, so an independent party assigns accountability.'
], 0)
R['ops-30'] = ([
  'Carbon Footprint in the Cloud console, exported to BigQuery and attributed by project and label.',
  'Cloud Billing reports, with spend converted to emissions using a published factor per dollar.',
  'Cloud Monitoring, with CPU utilisation converted to emissions per region.',
  'Active Assist recommendations, which list the emissions each idle resource produces.'
], 0)
R['ops-31'] = ([
  'Move to a paid Customer Care tier such as Enhanced or Premium, with 24/7 response targets for P1 cases.',
  'Stay on Basic support but open cases earlier in the day so they are answered before the evening.',
  'Buy a Technical Account Manager engagement without changing the support tier.',
  'Raise the case priority to P1 on the Basic tier so that it is answered within an hour.'
], 0)


# ── Second pass: even out the 43 where the key was still >10% longer ────────
R['dt-10'] = ([
  'TCO counts the purchase price of the hardware plus its depreciation and the support contract over the accounting period.',
  'TCO includes the full cost of running a system over its life: hardware, software, facilities, power, staff and maintenance.',
  'TCO compares the monthly cloud bill against the monthly cost of leasing equivalent hardware and support from a vendor.',
  'TCO includes hardware, software licences and vendor support contracts, but treats staff and facilities as overhead.'
], 1)
R['dt-19'] = ([
  'Patching the operating system of the servers that run Gmail and Drive, and keeping the mail software current.',
  'Controlling physical access to the data centres that host the service, and replacing failed storage hardware.',
  'Deciding who in the company can access which documents, and protecting user credentials.',
  'Running the backups of every mailbox and restoring them when a user deletes a message by mistake.'
], 2)
R['dt-27'] = ([
  'Agility: managed services, automation and elastic infrastructure let teams release small changes often and respond to the market.',
  'Cost: cloud pricing is lower than the bank\'s data centre, so the savings can fund a larger development team and faster hiring.',
  'Security: the provider takes over the bank\'s security obligations, freeing the security team to work directly on the mobile app.',
  'Compliance: the provider\'s certifications transfer to the bank, shortening the regulatory review that precedes each release.'
], 0)
R['dt-30'] = ([
  'Power, cooling, floor space and the staff time to maintain and eventually replace the hardware.',
  'The cost of over-provisioning: hardware sized for peak demand that sits idle most of the time.',
  'The cloud provider\'s data egress charges, which apply equally to traffic leaving an on-premises data centre.',
  'The operating-system licence fees, which are charged on-premises but included in every cloud VM price.'
], [0, 1])
R['data-03'] = ([
  'It makes queries run faster by indexing the tables that analysts access most frequently.',
  'It ensures data is accurate, consistent, secure, properly classified and used in line with policy.',
  'It reduces storage cost by archiving data that has not been queried within a set retention period.',
  'It replaces the need for backups by keeping a versioned copy of every table in the warehouse.'
], 1)
R['data-22'] = ([
  'It stores event data in partitioned tables so that it can be analysed later with SQL.',
  'It is an asynchronous messaging service that decouples event producers from consumers.',
  'It transforms events in flight by applying windowing, enrichment and deduplication logic.',
  'It schedules pipeline runs on a timetable and retries the steps that fail or time out.'
], 1)
R['data-23'] = ([
  'It is cheaper than batch processing because data is handled in small pieces rather than in large files.',
  'It lets an organisation react to events within seconds: catching fraud, adjusting prices, alerting on failures.',
  'It removes the need for a data warehouse because results are computed before the data is ever stored.',
  'It works on unstructured data such as images and audio, which batch processing is unable to read.'
], 1)
R['data-25'] = ([
  'Train a demand-forecasting model on the spreadsheets directly in Vertex AI, using AutoML to handle the cleaning.',
  'Consolidate the data into a central, governed store such as BigQuery so it can be cleaned, queried and shared.',
  'Build a Looker Studio dashboard connected to each spreadsheet so managers can see the full history at once.',
  'Upload the spreadsheets to Cloud Storage in the Archive class so they are preserved cheaply for future analysis.'
], 1)
R['ai-05'] = ([
  'The ability to understand and describe why a model produced a particular prediction, so humans can trust and check it.',
  'The ability of a model to describe the task it was trained for, in plain language, whenever a user queries it directly.',
  'The requirement that a model\'s training data and source code are published so that anyone can reproduce its results.',
  'The property of a model whose predictions are accurate enough that individual errors never need to be explained.'
], 0)
R['ai-18'] = ([
  'Google Cloud\'s unified platform for building, training, deploying and managing ML models, from AutoML to custom training.',
  'Google Cloud\'s collection of pre-trained APIs for vision, speech, language and translation, called through a single endpoint.',
  'Google Cloud\'s managed notebook service for exploring data and prototyping models in Python before they are productionised.',
  'Google Cloud\'s family of hardware accelerators for training very large deep learning models at lower cost than GPUs.'
], 0)
R['ai-20'] = ([
  'The model learns the specifics of your products, customers or documents, so its predictions are more accurate and more differentiating.',
  'The model trains faster on your data than on Google\'s much larger datasets, so it can be deployed sooner than a pre-trained API.',
  'The model needs no labelled data because AutoML infers the categories from your files, so preparation effort drops to almost nothing.',
  'The model runs inside your own project without any external network access, so serving it costs nothing beyond storage.'
], 0)
R['ai-22'] = ([
  'Custom training of a large language model on Cloud TPUs using the company\'s own text.',
  'Generative AI models such as Gemini through Vertex AI, used as a managed foundation model.',
  'AutoML text classification in Vertex AI trained on the company\'s past product descriptions.',
  'The Natural Language API called on existing descriptions to generate new ones by entity.'
], 1)
R['ai-29'] = ([
  'A Gemini foundation model through Vertex AI, grounded on its own documents, under Google Cloud\'s data-use terms.',
  'A large language model trained from scratch on its own documents using Cloud TPUs, so no data leaves the firm.',
  'AutoML text classification in Vertex AI trained on labelled clauses from past contracts, with templates for drafting.',
  'The Natural Language API for entity extraction from case files, combined with document templates for drafting.'
], 0)
R['infra-02'] = ([
  'Rehost: move the application as-is onto virtual machines in the cloud.',
  'Replatform: move the application with modest changes to use managed services.',
  'Refactor: rebuild the application as containers and microservices first.',
  'Reimagine: redesign the business process and build a new application.'
], 1)
R['infra-05'] = ([
  'A physical server in a Google data centre reserved for a single customer\'s exclusive use and billed monthly.',
  'A software emulation of a computer, with its own operating system, running on shared physical hardware.',
  'A packaged application with its dependencies that shares the host machine\'s operating system kernel.',
  'A managed runtime that executes application code on demand without an operating system to maintain.'
], 1)
R['infra-09'] = ([
  'Standard on-demand VMs, sized precisely to the job',
  'Spot VMs, heavily discounted but reclaimable by Google at short notice',
  'Sole-tenant nodes, dedicated to the research team\'s jobs alone',
  'Standard VMs under a one-year committed use discount contract'
], 1)
R['infra-17'] = ([
  'A defined way for one piece of software to request services or data from another, without knowing its internals.',
  'A graphical interface through which administrators configure the services an application depends on at runtime.',
  'A shared database schema that two applications agree on so that each can read and write the other\'s tables.',
  'A network rule that allows one application to reach another through a firewall on an agreed port and protocol.'
], 0)
R['infra-19'] = ([
  'Partners and developers can build on your services, extending your reach into new channels, and usage can be monetised.',
  'Public APIs remove the need for a sales team, because customers discover, integrate and pay without any human contact.',
  'Public APIs shift security responsibility to the partners who call them, reducing your own exposure and audit scope.',
  'Public APIs let you pull a partner\'s data into your own systems, enlarging your data estate for analytics and ML.'
], 0)
R['infra-20'] = ([
  'A platform for running and managing applications consistently across on-premises, Google Cloud and other clouds.',
  'A platform for migrating virtual machines from on-premises data centres into Compute Engine with minimal downtime.',
  'A platform for hosting containers serverlessly across regions, scaling each service to zero between requests.',
  'A platform for managing API traffic between on-premises systems and cloud services, with quotas and analytics.'
], 0)
R['infra-21'] = ([
  'Some workloads must stay on-premises for regulatory, latency or legacy reasons while others benefit from public cloud.',
  'Running the same workload in two public clouds at once protects the organisation against a single provider\'s outage.',
  'Keeping a copy of every cloud workload on-premises guarantees the lowest possible total cost over the hardware\'s life.',
  'Public cloud cannot run relational databases with transactions, so those systems must remain on-premises.'
], 0)
R['infra-22'] = ([
  'A single control plane for configuration, policy and observability across every cluster, reducing effort and inconsistency.',
  'Automatic migration of the on-premises cluster into Google Cloud, so that only one environment remains to be secured.',
  'A managed VPN between the two clusters, so that workloads and their policies can move between them at any time.',
  'A single billing account covering both clusters, so that the cost of each security policy can be compared side by side.'
], 0)
R['infra-23'] = ([
  'Refactor the applications into containers on GKE before moving them, so they arrive cloud-native.',
  'Rehost the VMs to Compute Engine or Google Cloud VMware Engine, then modernise selectively.',
  'Replatform each application onto Cloud Run during the move, swapping databases for Cloud SQL.',
  'Reimagine the applications as serverless functions before the deadline, retiring the VMs.'
], 1)
R['infra-24'] = ([
  'Applications run faster than on other platforms because the provider assigns dedicated hardware to each function.',
  'Teams pay only for actual execution and never manage servers, so effort shifts from infrastructure to features.',
  'Applications can be deployed without a code repository, because the provider stores and versions the source.',
  'Teams get a fixed monthly price for compute regardless of traffic, so budgeting becomes fully predictable.'
], 1)
R['sec-17'] = ([
  'So customers can verify, rather than take on faith, how Google handles data requests and whether its controls meet standards.',
  'So regulators can approve each new Google Cloud region before customers are permitted to store regulated data there.',
  'So customers can see which other organisations use Google Cloud and benchmark their own security configurations.',
  'So Google can transfer its compliance obligations to the independent auditors who sign the published reports.'
], 0)
R['sec-20'] = ([
  'Enforcing strong passwords and two-step verification for the customer\'s own users.',
  'Physical security of the data centres and the security of the underlying infrastructure and services.',
  'Deciding which of the customer\'s data may be made publicly accessible and for how long.',
  'Configuring the customer\'s firewall rules and IAM roles correctly for each project.'
], 1)
R['sec-21'] = ([
  'Accepting the provider\'s terms of service and acceptable-use policy for each product the organisation enables.',
  'Meeting the laws, regulations and industry standards that apply to your data and operations, and being able to demonstrate it.',
  'Configuring every service according to the provider\'s published security best practices and reviewing them annually.',
  'Keeping all software on supported versions so that known vulnerabilities are patched within the vendor\'s window.'
], 1)
R['sec-22'] = ([
  'Availability, and often confidentiality if data is also stolen; the defence is layered: patching, least privilege, isolated backups.',
  'Integrity, because the files are modified without authorisation; the defence is checksums and version control on every file.',
  'Confidentiality, because the attackers can read the files before encrypting them; the defence is stronger encryption at rest.',
  'Availability only, because the files cannot be opened; the defence is a faster network so that files restore more quickly.'
], 0)
R['sec-23'] = ([
  'Access is never granted just because a request comes from inside the network; every request is verified on identity and context.',
  'Access is granted to any request from inside the corporate network and verified only for requests that come from outside it.',
  'Access is verified once at login, and the resulting session is trusted for all resources on the network until it expires.',
  'Access is denied by default to everyone, and granted only after a manager approves each individual request manually.'
], 0)
R['sec-30'] = ([
  'The Compliance Resource Center and Compliance Reports Manager, to download Google Cloud\'s audit reports and certifications.',
  'Security Command Center, to generate a PCI DSS and ISO 27001 assessment report on the start-up\'s own projects.',
  'A support case with Customer Care, to request that Google issue a compliance certificate naming the start-up.',
  'Cloud Audit Logs exported to BigQuery, to prove to the auditor that no unauthorised access to card data occurred.'
], 0)
R['ops-01'] = ([
  'The policies, processes and tools that give an organisation visibility, predictability and control over cloud spending.',
  'The accounting rules that determine whether cloud spending is recorded as capital or operating expenditure each year.',
  'The approval workflow that finance must complete before any new cloud resource can be created in a production project.',
  'The discount agreements negotiated with the provider to lower the price of committed usage over one or three years.'
], 0)
R['ops-09'] = ([
  'The service keeps running with minimal downtime by removing single points of failure through redundancy.',
  'The service can be restored from backups within an agreed time after a failure takes it fully offline.',
  'The service can scale to many times its normal load without a measurable drop in response time.',
  'The service is deployed in several regions so that users everywhere experience low latency.'
], 0)
R['ops-12'] = ([
  'A culture and set of practices that bring development and operations together, using automation and shared responsibility.',
  'An organisational model in which a single operations team owns deployment and monitoring for every development team.',
  'A toolset for continuous integration and delivery that replaces the operations team with fully automated pipelines.',
  'A contract under which operations is outsourced to the cloud provider while development stays with the in-house team.'
], 0)
R['ops-14'] = ([
  'The unreliability an SLO allows, which the team can spend on risky releases until it runs out.',
  'The money set aside each quarter to pay service credits to customers when the SLA is missed.',
  'The number of incidents a service may have per quarter before its SLO is tightened.',
  'The share of engineering time reserved for fixing bugs rather than building new features.'
], 0)
R['ops-16'] = ([
  'Tiered support from Basic to Premium, with faster response times and technical account management as the tier rises.',
  'A single support level for every customer, with response times set by the severity the customer assigns to each case.',
  'Consulting engagements in which Google engineers design, build and hand over the customer\'s cloud architecture.',
  'A managed operations service in which Google runs and monitors the customer\'s workloads on the customer\'s behalf.'
], 0)
R['ops-18'] = ([
  'Google has matched 100% of its annual electricity use with renewables since 2017 and aims for 24/7 carbon-free energy by 2030.',
  'Google has run every data centre directly on renewable energy since 2017 and aims to be carbon neutral across operations by 2030.',
  'Google has been carbon neutral since 2017 and aims to match 100% of its annual electricity use with renewable purchases by 2030.',
  'Google aims to match 100% of its electricity use with renewables by 2030 and to run on carbon-free energy 24/7 by 2040.'
], 0)
R['ops-20'] = ([
  'Google\'s data centres are far more energy-efficient than typical enterprise facilities and use a high share of carbon-free energy.',
  'Google\'s data centres use the same energy per workload as an enterprise facility, but Google buys carbon offsets on the customer\'s behalf.',
  'Cloud servers are switched off between requests, so a workload running in the cloud uses almost no electricity when it is idle.',
  'Moving to the cloud only reduces impact if the customer also chooses the Archive storage class for all of its long-term data.'
], 0)
R['ops-21'] = ([
  'Deploy it in a region with a higher carbon-free energy percentage, flagged in the console as low CO₂.',
  'Deploy it in the region closest to the company\'s headquarters to minimise network distance and transit.',
  'Deploy it on the largest available machine type so that the workload finishes as quickly as possible.',
  'Deploy it in two regions so that either one can be switched off whenever its local grid is dirty.'
], 0)
R['ops-22'] = ([
  'Environmental impact has become a business metric that customers, investors and regulators track, and cloud choices affect it.',
  'Sustainability reporting is a legal requirement in every country where Google Cloud operates a region or an edge location.',
  'Sustainable regions are cheaper to run because renewable power costs less, so choosing them is a cost-optimisation decision.',
  'Google requires customers to report their emissions each year as a condition of the Google Cloud service agreement.'
], 0)
R['ops-25'] = (['Cloud Monitoring, Cloud Logging and Cloud Trace', 'Cloud Audit Logs and Access Transparency', 'Security Command Center and Cloud Armor', 'Cloud Billing reports and Recommender'], 0)


def js_str(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def rewrite(path):
    src = pathlib.Path(path).read_text()
    changed = 0
    for qid, (opts, ans) in R.items():
        marker = f"id: '{qid}',"
        i = src.find(marker)
        if i < 0:
            continue
        j = src.find('explanation:', i)
        block = src[i:j]
        new_opts = 'options: [\n' + ''.join(f'      {js_str(o)},\n' for o in opts).rstrip(',\n') + '\n    ],'
        new_ans = 'answer: ' + (str(ans) if isinstance(ans, list) else str(ans)) + ','
        block2 = re.sub(r"options: \[.*?\],", new_opts, block, count=1, flags=re.S)
        block2 = re.sub(r"answer: (\[[^\]]*\]|\d+),", new_ans, block2, count=1)
        if block2 != block:
            src = src[:i] + block2 + src[j:]
            changed += 1
    pathlib.Path(path).write_text(src)
    return changed


base = pathlib.Path('src/exams/cdl/questions')
total = 0
for f in base.glob('*.js'):
    n = rewrite(f)
    print(f.name, n)
    total += n
print('rewritten', total, 'of', len(R))

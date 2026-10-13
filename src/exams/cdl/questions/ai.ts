/**
 * Section 3 — Innovating with Google Cloud artificial intelligence (~16%)
 * AI and ML fundamentals, choosing between pre-trained APIs, AutoML and custom
 * models, and Google Cloud's AI products.
 */

import type { Question } from '@/types';

export const ai: Question[] = [
  // ── AI and ML fundamentals ───────────────────────────────────────────────
  {
    id: 'ai-01',
    topic: 'AI & ML fundamentals',
    difficulty: 'easy',
    prompt: 'What is the relationship between artificial intelligence (AI) and machine learning (ML)?',
    options: [
      'ML is a subset of AI: AI is the broad goal of human-like intelligence, and ML is the approach where systems learn from data.',
      'AI is a subset of ML: ML is the broad goal of human-like intelligence, and AI is the approach where systems learn from data.',
      'AI and ML are separate fields: AI covers rule-based expert systems, and ML covers statistical models trained on data.',
      'AI and ML are the same field: the term AI is used for research and ML for the same techniques in production.'
    ],
    answer: 0,
    explanation:
      'AI is the umbrella. ML is the technique that dominates it today: show a model many examples and let it learn the rules itself, instead of a programmer writing the rules by hand.'
  },
  {
    id: 'ai-02',
    topic: 'AI & ML fundamentals',
    difficulty: 'medium',
    prompt: 'How does machine learning differ from traditional business intelligence (BI) and data analytics?',
    options: [
      'BI describes and explains what has happened; ML learns from data to predict or decide for new, unseen cases.',
      'BI learns from data to predict or decide for new, unseen cases; ML describes and explains what has happened.',
      'BI works on structured data in warehouses; ML works only on unstructured data such as images and text.',
      'BI needs a large historical dataset; ML can work with a handful of examples and no history.'
    ],
    answer: 0,
    explanation:
      'A dashboard tells you last quarter\'s churn rate. An ML model tells you which customers are likely to churn next month. Descriptive versus predictive is the line the exam draws.'
  },
  {
    id: 'ai-03',
    topic: 'AI & ML fundamentals',
    difficulty: 'medium',
    prompt: 'A telecom wants to predict which subscribers will cancel next month. What type of ML problem is this?',
    options: [
      'Clustering: grouping subscribers with similar usage into segments.',
      'Classification: predicting a category such as will churn or will not churn.',
      'Regression: predicting a numeric value such as months until cancellation.',
      'Anomaly detection: flagging subscribers whose usage is unusual.'
    ],
    answer: 1,
    explanation:
      'Predicting a label from a fixed set is classification. Predicting a number (next month\'s revenue) is regression. Grouping similar customers with no labels is clustering. Knowing the family helps you ask a data team the right question.'
  },
  {
    id: 'ai-04',
    topic: 'AI & ML fundamentals',
    difficulty: 'easy',
    prompt: 'Why does the quality of training data matter so much for a machine learning model?',
    options: [
      'A model learns whatever patterns are in its data, so inaccurate, incomplete or biased data produces an inaccurate or biased model.',
      'A model corrects for errors in its data during training, so quality matters less than the quantity of examples provided.',
      'A model trained on high-quality data needs less compute, so data quality mainly affects training cost and speed.',
      'A model\'s accuracy depends on its architecture, so data quality mainly affects how long training takes to converge.'
    ],
    answer: 0,
    explanation:
      '"Garbage in, garbage out" applies with force to ML. The model has no other source of truth than its examples, so data quality work is most of the effort in a real project.'
  },
  {
    id: 'ai-05',
    topic: 'AI & ML fundamentals',
    difficulty: 'easy',
    prompt: 'What does "explainable AI" mean?',
    options: [
      'The ability to understand and describe why a model produced a particular prediction, so humans can trust and check it.',
      'The ability of a model to describe the task it was trained for, in plain language, whenever a user queries it directly.',
      'The requirement that a model\'s training data and source code are published so that anyone can reproduce its results.',
      'The property of a model whose predictions are accurate enough that individual errors never need to be explained.'
    ],
    answer: 0,
    explanation:
      'A loan-denial model that cannot say which factors drove the decision is hard to audit and may be illegal to deploy. Explainability tools attribute a prediction to its inputs.'
  },
  {
    id: 'ai-06',
    topic: 'AI & ML fundamentals',
    difficulty: 'medium',
    prompt: 'A hiring model was trained on ten years of past hiring decisions and now recommends far fewer women than men. What is the most likely cause?',
    options: [
      'The model was trained on too little data, so it cannot generalise to female applicants.',
      'Historical bias in the training data has been learned and reproduced by the model.',
      'The model was optimised for speed rather than accuracy, so it ignores some features.',
      'The model was trained in a region whose labour laws differ from the company\'s.'
    ],
    answer: 1,
    explanation:
      'The model is faithfully reproducing patterns in its examples — including unfair ones. This is why responsible AI practice includes checking training data and outcomes for bias before and after deployment.'
  },
  {
    id: 'ai-07',
    topic: 'AI & ML fundamentals',
    difficulty: 'medium',
    prompt: 'Which TWO are business benefits of machine learning listed in the exam guide? (Choose two.)',
    options: [
      'Finding patterns in datasets far too large for people to review.',
      'Removing the need for human oversight once the model is deployed.',
      'Unlocking value from unstructured data such as images, audio and text.',
      'Guaranteeing that predictions are correct when the input data is complete.'
    ],
    answer: [0, 2],
    explanation:
      'The guide highlights three: working with huge datasets, scaling business decisions, and unlocking unstructured data. ML does not remove the need for oversight and never guarantees correctness.'
  },

  // ── Google Cloud's AI and ML solutions ───────────────────────────────────
  {
    id: 'ai-08',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'easy',
    prompt:
      'A small company with no data scientists wants to detect common objects and text in product photos. Which approach is fastest and simplest?',
    options: [
      'Train a custom image model in Vertex AI using their product photos.',
      'Use a pre-trained API such as the Vision API.',
      'Use AutoML in Vertex AI with a small set of labelled photos.',
      'Use BigQuery ML on the product catalogue data.'
    ],
    answer: 1,
    explanation:
      'Pre-trained APIs are already trained on Google\'s data for common tasks. You send an image and get labels back — no training, no ML expertise. They are the right choice when the task is generic.'
  },
  {
    id: 'ai-09',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'medium',
    prompt:
      'A manufacturer needs to spot defects specific to its own products, which a generic image model does not recognise. It has thousands of labelled photos but no ML engineers. Which option fits?',
    options: [
      'The pre-trained Vision API, with the defect categories passed as parameters.',
      'AutoML in Vertex AI, trained on its own labelled images without writing model code.',
      'A custom model in Vertex AI, written in TensorFlow by a contracted data scientist.',
      'BigQuery ML, with the photos loaded into a table as binary columns.'
    ],
    answer: 1,
    explanation:
      'AutoML (now part of Vertex AI) is the middle road: your own data, so the model learns your domain, but Google handles model architecture and tuning. It sits between pre-trained APIs and fully custom models.'
  },
  {
    id: 'ai-10',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'medium',
    prompt: 'Which TWO factors does the exam guide say to weigh when choosing between pre-trained APIs, AutoML and custom models? (Choose two.)',
    options: [
      'The speed of deployment and the effort required.',
      'The programming language the model will be written in.',
      'The differentiation the solution provides and the in-house expertise available.',
      'The region in which the model will be served.'
    ],
    answer: [0, 2],
    explanation:
      'The four trade-off factors are speed, effort, differentiation and required expertise. Pre-trained wins on speed and effort; custom wins on differentiation but demands expertise.'
  },
  {
    id: 'ai-11',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'hard',
    prompt: 'In which TWO situations is building a fully custom model the right choice rather than a pre-trained API? (Choose two.)',
    options: [
      'The problem is unique to the business and the model itself is a competitive differentiator.',
      'The task is generic, such as translating text, but the company wants full ownership of the code.',
      'No pre-trained model covers the data type or domain, and the company has ML expertise.',
      'The company needs a result this week and has a small labelled dataset ready.'
    ],
    answer: [0, 2],
    explanation:
      'Custom models cost time and expertise, so they only pay off when the problem is unusual or the model is the product. Generic tasks and tight deadlines point to pre-trained APIs.'
  },
  {
    id: 'ai-12',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'easy',
    prompt: 'Which statement about pre-trained APIs is correct?',
    options: [
      'They are trained by the customer on Google\'s infrastructure and then called through a managed endpoint.',
      'They are trained by Google on large datasets and can be called immediately for common tasks.',
      'They are trained by Google and then fine-tuned automatically on each customer\'s first thousand requests.',
      'They are trained by Google and must be retrained by the customer each time the underlying data changes.'
    ],
    answer: 1,
    explanation:
      'A pre-trained API is a finished model behind an endpoint. You get Google-scale training for free in exchange for accepting a general-purpose model.'
  },

  // ── Building and using Google Cloud AI and ML solutions ──────────────────
  {
    id: 'ai-13',
    topic: 'Building with Google Cloud AI',
    difficulty: 'easy',
    prompt: 'What does BigQuery ML allow analysts to do?',
    options: [
      'Create and run machine learning models using standard SQL directly inside BigQuery.',
      'Export BigQuery tables to Vertex AI notebooks and train models in Python there.',
      'Call pre-trained Vision and Natural Language models on data stored in BigQuery.',
      'Schedule BigQuery queries so that model features are refreshed every night.'
    ],
    answer: 0,
    explanation:
      'CREATE MODEL ... is a SQL statement in BigQuery ML. It lets people who already know SQL build forecasting, classification and recommendation models where the data already lives.'
  },
  {
    id: 'ai-14',
    topic: 'Building with Google Cloud AI',
    difficulty: 'easy',
    prompt: 'A company wants to measure the sentiment of thousands of product reviews. Which pre-trained API should it use?',
    options: ['Vision API', 'Natural Language API', 'Speech-to-Text API', 'Text-to-Speech API'],
    answer: 1,
    explanation:
      'The Natural Language API analyses text: sentiment, entities, syntax and content classification. Vision is for images; Speech-to-Text converts audio into text; Text-to-Speech does the reverse.'
  },
  {
    id: 'ai-15',
    topic: 'Building with Google Cloud AI',
    difficulty: 'easy',
    prompt: 'A call centre wants searchable transcripts of recorded customer calls. Which API converts the recordings into text?',
    options: ['Text-to-Speech API', 'Cloud Translation API', 'Speech-to-Text API', 'Vision API'],
    answer: 2,
    explanation:
      'Speech-to-Text takes audio in and produces text out. If the company then wanted to read that text aloud in an app, Text-to-Speech would do the reverse.'
  },
  {
    id: 'ai-16',
    topic: 'Building with Google Cloud AI',
    difficulty: 'easy',
    prompt: 'An e-commerce site wants to show product descriptions in a shopper\'s own language automatically. Which API fits?',
    options: ['Cloud Translation API', 'Natural Language API', 'Vision API', 'Speech-to-Text API'],
    answer: 0,
    explanation:
      'The Cloud Translation API translates text between languages, detecting the source language if needed. It is the standard choice for localising content on the fly.'
  },
  {
    id: 'ai-17',
    topic: 'Building with Google Cloud AI',
    difficulty: 'easy',
    prompt: 'An accessibility team wants an app to read articles aloud in a natural-sounding voice. Which API should they use?',
    options: ['Speech-to-Text API', 'Text-to-Speech API', 'Natural Language API', 'Vision API'],
    answer: 1,
    explanation:
      'Text-to-Speech synthesises spoken audio from text, with a choice of voices and languages. Speech-to-Text goes the other way.'
  },
  {
    id: 'ai-18',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt: 'What is Vertex AI?',
    options: [
      'Google Cloud\'s unified platform for building, training, deploying and managing ML models, from AutoML to custom training.',
      'Google Cloud\'s collection of pre-trained APIs for vision, speech, language and translation, called through a single endpoint.',
      'Google Cloud\'s managed notebook service for exploring data and prototyping models in Python before they are productionised.',
      'Google Cloud\'s family of hardware accelerators for training very large deep learning models at lower cost than GPUs.'
    ],
    answer: 0,
    explanation:
      'Vertex AI brings the whole ML workflow together: datasets, AutoML and custom training, model registry, deployment endpoints and monitoring. It is where a company builds the models that differentiate it.'
  },
  {
    id: 'ai-19',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt: 'Which statement about TensorFlow and Cloud TPUs is correct?',
    options: [
      'TensorFlow is an open source ML framework created by Google; Cloud TPUs are Google-designed hardware accelerators for ML.',
      'TensorFlow is Google-designed hardware for ML; Cloud TPUs are the open source framework that runs on it.',
      'TensorFlow is a managed training service in Vertex AI; Cloud TPUs are the notebooks used to write the training code.',
      'TensorFlow is a proprietary Google framework; Cloud TPUs are commodity GPUs rented by the hour.'
    ],
    answer: 0,
    explanation:
      'TensorFlow is the software (open source, runs anywhere). A TPU — Tensor Processing Unit — is a custom chip Google offers in its cloud to speed up training and inference. The exam guide wants you to keep the two straight.'
  },
  {
    id: 'ai-20',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt: 'What is the main business value of training a model on your own data with AutoML rather than using a generic pre-trained API?',
    options: [
      'The model learns the specifics of your products, customers or documents, so its predictions are more accurate and more differentiating.',
      'The model trains faster on your data than on Google\'s much larger datasets, so it can be deployed sooner than a pre-trained API.',
      'The model needs no labelled data because AutoML infers the categories from your files, so preparation effort drops to almost nothing.',
      'The model runs inside your own project without any external network access, so serving it costs nothing beyond storage.'
    ],
    answer: 0,
    explanation:
      'A generic model knows what a "shoe" is; a model trained on your catalogue knows your shoe models and their defects. Own-data training is how ML becomes a competitive advantage rather than a commodity.'
  },
  {
    id: 'ai-21',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt:
      'A bank wants ML to help approve loans, and regulators require every decision to be justified. Which capability should be part of the solution?',
    options: [
      'The fastest available model so that customers get an approval decision immediately.',
      'Explainable AI features that attribute each prediction to its inputs, plus monitoring for bias.',
      'A larger training set so that the model\'s overall accuracy satisfies the regulator.',
      'A rule that every model decision is automatically final so that outcomes are consistent.'
    ],
    answer: 1,
    explanation:
      'Responsible AI in a regulated setting means being able to explain outcomes and to detect unfair treatment of groups. Vertex AI includes explanation and model-monitoring tools for exactly this.'
  },

  {
    id: 'ai-22',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'medium',
    prompt:
      'A marketing team wants to draft product descriptions and summarise customer feedback using a large language model, without training anything themselves. Which Google Cloud offering fits?',
    options: [
      'Custom training of a large language model on Cloud TPUs using the company\'s own text.',
      'Generative AI models such as Gemini through Vertex AI, used as a managed foundation model.',
      'AutoML text classification in Vertex AI trained on the company\'s past product descriptions.',
      'The Natural Language API called on existing descriptions to generate new ones by entity.'
    ],
    answer: 1,
    explanation:
      'Foundation models in Vertex AI are the generative-AI equivalent of a pre-trained API: a ready-made model you prompt, optionally tune, and integrate — no training pipeline required. The trade-off logic is the same: speed and low effort versus differentiation.'
  },
  {
    id: 'ai-23',
    topic: 'AI & ML fundamentals',
    difficulty: 'medium',
    prompt: 'A grocery chain wants to forecast next week\'s demand for each product to reduce waste. What kind of ML problem is this?',
    options: [
      'Classification: predicting whether each product will sell out.',
      'Regression: predicting a numeric quantity such as units sold.',
      'Clustering: grouping products with similar sales patterns.',
      'Recommendation: predicting which products a shopper will buy.'
    ],
    answer: 1,
    explanation:
      'Demand is a number, so this is regression (or, given the time dimension, forecasting). BigQuery ML has a built-in time-series model (ARIMA_PLUS) that a SQL analyst can use for exactly this.'
  },
  {
    id: 'ai-24',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt: 'Which product lets a company extract structured fields — invoice number, total, due date — from scanned documents at scale?',
    options: [
      'Document AI',
      'Natural Language API',
      'Vision API',
      'AutoML Tables'
    ],
    answer: 0,
    explanation:
      'Document AI combines OCR with pre-trained and custom processors for forms, invoices, receipts and contracts. It is the pre-trained-API answer for "we have a mountain of paperwork".'
  },


  // ── Scenario questions: a business situation, four plausible options ─────
  {
    id: 'ai-25',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt:
      'A national bank receives 20,000 customer support calls a day. Management wants to know which topics drive complaints and how sentiment changes week by week, but reviewing recordings manually covers less than 1% of calls. The bank has no ML engineers. Which combination should it use?',
    options: [
      'Speech-to-Text to transcribe the calls, then the Natural Language API for sentiment and entities.',
      'Speech-to-Text to transcribe the calls, then a custom sentiment model trained on Vertex AI.',
      'The Natural Language API on the call recordings directly, since it accepts audio input.',
      'Text-to-Speech to normalise the recordings, then the Natural Language API for sentiment.'
    ],
    answer: 0,
    explanation:
      'Two pre-trained APIs chained: audio → text, then text → sentiment and topics. No training, no ML staff, deployable in days. A custom model is unwarranted for a generic task, and the other two options confuse the direction of the data.'
  },
  {
    id: 'ai-26',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'medium',
    prompt:
      'A fashion retailer wants to tag product photos with its own internal categories — "boho", "athleisure", "capsule" — which the generic Vision API labels do not match. It has 50,000 photos already tagged by merchandisers and two analysts who know no ML code. What should it use?',
    options: [
      'AutoML image classification in Vertex AI, trained on the tagged photos.',
      'The pre-trained Vision API with the internal categories added as labels.',
      'A custom convolutional network built by a contracted data scientist.',
      'The Vision API for labels, mapped to internal categories with a lookup table.'
    ],
    answer: 0,
    explanation:
      'Own labelled data, own categories, no ML engineers: AutoML. The generic API cannot learn "boho"; a from-scratch model needs expertise they lack; BigQuery ML works on tabular data in BigQuery, not images.'
  },
  {
    id: 'ai-27',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt:
      'A supermarket chain\'s analysts live in BigQuery, where five years of sales data already sit. They want weekly demand forecasts per store and product to cut waste, and they want to iterate themselves without waiting for the data science team. What is the most appropriate tool?',
    options: [
      'BigQuery ML',
      'AutoML Tables in Vertex AI',
      'Custom TensorFlow on Cloud TPUs',
      'Looker forecasting'
    ],
    answer: 0,
    explanation:
      'The data is in BigQuery, the people speak SQL, and forecasting is a standard model type — BigQuery ML (ARIMA_PLUS) lets them build and run it with CREATE MODEL. Moving the data out to a custom TPU pipeline adds cost and dependency for no gain.'
  },
  {
    id: 'ai-28',
    topic: 'AI & ML fundamentals',
    difficulty: 'hard',
    prompt:
      'A lender deploys a model to pre-approve loans. Six months later an audit finds applicants from one postcode area are declined at twice the rate of otherwise similar applicants, and staff cannot explain any individual decision. Which TWO measures should the lender have had in place? (Choose two.)',
    options: [
      'Explainability tooling that attributes each prediction to its input features.',
      'A retraining schedule so the model always uses the most recent applications.',
      'Bias evaluation of the training data and ongoing monitoring of outcomes by group.',
      'A larger training set so that every postcode has enough examples.'
    ],
    answer: [0, 2],
    explanation:
      'The two failures are opacity and disparate impact, which map to explainable AI and responsible-AI bias checks respectively. Speed is irrelevant to the audit finding, and removing humans would make the situation worse.'
  },
  {
    id: 'ai-29',
    topic: 'Choosing an AI/ML solution',
    difficulty: 'medium',
    prompt:
      'A legal-services firm wants a tool that drafts first versions of standard contracts from a short brief and summarises long case files. It wants results this quarter and has no data science team, but the documents are confidential and must not train a public model. What should it use?',
    options: [
      'A Gemini foundation model through Vertex AI, grounded on its own documents, under Google Cloud\'s data-use terms.',
      'A large language model trained from scratch on its own documents using Cloud TPUs, so no data leaves the firm.',
      'AutoML text classification in Vertex AI trained on labelled clauses from past contracts, with templates for drafting.',
      'The Natural Language API for entity extraction from case files, combined with document templates for drafting.'
    ],
    answer: 0,
    explanation:
      'Generative text tasks with speed and no ML team point to a managed foundation model. Vertex AI lets enterprises use Gemini with their data under contractual terms that keep customer data out of Google\'s training — the trade-off logic of "pre-trained beats custom when the task is generic" applied to generative AI.'
  },
  {
    id: 'ai-30',
    topic: 'Building with Google Cloud AI',
    difficulty: 'medium',
    prompt:
      'An accounts-payable department keys 40,000 supplier invoices a month by hand from PDFs and scans, with frequent errors in totals and due dates. They want to extract those fields automatically and route the results to their ERP. Which product should they evaluate first?',
    options: [
      'Document AI',
      'Vision API OCR with custom parsing',
      'Natural Language API',
      'Dataprep'
    ],
    answer: 0,
    explanation:
      'Structured field extraction from scanned documents is Document AI\'s purpose, with a ready-made invoice processor. The other options handle audio, transactions and Spark jobs respectively.'
  },
];

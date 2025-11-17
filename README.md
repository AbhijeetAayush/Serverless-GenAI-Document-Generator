# Serverless GenAI Document Generator

A production-ready serverless application that enables maintenance technicians to upload operational documents and generate formatted check-sheets (XLSX) or work instructions (DOCX) using GenAI.

## Architecture

The application follows a microservices architecture with the following services:

1. **Document Ingestion Service**: Handles document uploads, text extraction, and vector embedding storage
2. **Prompt Management Service**: Manages use-case prompts stored in Neptune graph database
3. **Query + Retrieval + Generation Service**: Retrieves relevant document chunks, fetches prompts, and generates content using LLM
4. **Output Formatter Service**: Converts LLM output to XLSX/DOCX formats and uploads to S3

## Tech Stack

- **Backend**: AWS SAM, TypeScript, Node.js
- **Frontend**: React + Vite (to be added)
- **Storage**: S3, DynamoDB, OpenSearch (Vector DB), Neptune (Graph DB)
- **AI/ML**: Amazon Bedrock (Claude/Gemini), LangChain
- **Authentication**: AWS Cognito
- **Infrastructure**: Serverless Framework (SAM)

## Project Structure

```
.
├── template.yaml                 # Root SAM template
├── api/                         # API Gateway OpenAPI specs
├── modules/                     # Microservice modules
│   ├── document-ingestion/
│   ├── prompt-management/
│   ├── query-retrieval/
│   └── output-formatter/
├── packages/                    # Shared packages
│   └── shared/                 # Shared utilities and types
├── utils/                       # Common utilities
└── types/                       # TypeScript type definitions
```

## Prerequisites

- Node.js >= 20.x
- AWS CLI configured
- AWS SAM CLI installed
- AWS Account with appropriate permissions

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Deploy to AWS:
```bash
npm run deploy --guided
```

## Use Cases

### Use Case 1: Generate Checksheet (XLSX)
- Upload 2-3 operational documents
- Select "Checksheet Generation" use case
- System extracts information using RAG
- Generates formatted XLSX checksheet
- Returns downloadable file

### Use Case 2: Generate Work Instructions (DOCX)
- Upload 2-3 operational documents
- Select "Work Instructions" use case
- System extracts information using RAG
- Generates structured DOCX work instructions
- Returns downloadable file

## Development

This project uses a monorepo structure with nested SAM templates for each microservice. Each module is independently deployable and follows clean architecture principles.

## License

Proprietary


import os
import re
from typing import List
from langchain_community.vectorstores import FAISS
from langchain.schema import Document

DOCS_DIR = r"D:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\data\vlearn-pack\documents"
VECTOR_DB_DIR = r"D:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\codebase\src\vlearn-platform\backend\vector_store"

def chunk_markdown_file(filepath: str) -> List[Document]:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    paragraphs = re.split(r'\n\s*\n', content)
    
    docs = []
    current_header = ""
    filename = os.path.basename(filepath)
    
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        
        # Determine if it's a header line at the start of the paragraph
        # Sometimes a paragraph is just a header.
        lines = p.split('\n')
        first_line = lines[0]
        header_match = re.match(r'^(#{1,6})\s+(.*)', first_line)
        
        if header_match:
            current_header = first_line
            # If the paragraph is more than just the header, prepend header? 
            # Actually, the paragraph already has the header in it.
            doc_content = p
        else:
            if current_header:
                doc_content = f"{current_header}\n\n{p}"
            else:
                doc_content = p
                
        meta = {"source": filename}
        if current_header:
            meta["header"] = current_header
            
        docs.append(Document(page_content=doc_content, metadata=meta))
        
    return docs

def build_vector_db():
    all_docs = []
    for filename in os.listdir(DOCS_DIR):
        if filename.endswith(".md"):
            filepath = os.path.join(DOCS_DIR, filename)
            print(f"Processing {filepath}")
            docs = chunk_markdown_file(filepath)
            all_docs.extend(docs)
            
    print(f"Total chunks: {len(all_docs)}")
    
    # using langchain-huggingface for newer versions, but we installed langchain-community
    from langchain_community.embeddings import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(all_docs, embeddings)
    
    os.makedirs(VECTOR_DB_DIR, exist_ok=True)
    vectorstore.save_local(VECTOR_DB_DIR)
    print(f"Vector DB saved to {VECTOR_DB_DIR}")

if __name__ == "__main__":
    build_vector_db()

from transformers import pipeline
classifier = pipeline("zero-shot-classification",
                      model="facebook/bart-large-mnli")

CLASSES = ["general", "data query", "data analysis"]

def classify(inp: str):
  score = classifier(inp, CLASSES).score
  type = CLASSES[min(range(len(score)), key=score.__getitem__)]
  return type

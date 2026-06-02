ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_document_type_check;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_document_type_check
  CHECK (document_type IN ('prd', 'srs', 'system_design', 'architecture', 'design-system', 'api-spec', 'readme'));

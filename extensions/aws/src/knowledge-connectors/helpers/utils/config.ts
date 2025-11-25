const MAX_CHUNK_SIZE = 2000;

const LANGCHAIN_DEFAULT_CHUNK_SIZE_IN_CHARS = 2000;

export const getMaxChunkSize = (): number => {
  return MAX_CHUNK_SIZE;
};

export const langchainDefaultChunkSizeInChars = (): number => {
  return LANGCHAIN_DEFAULT_CHUNK_SIZE_IN_CHARS;
};
export const getMaxChunkSize = (defaultLimit: number = 2000): number => {
  return parseInt(process.env.MAX_CHUNK_SIZE, 10) || defaultLimit;
};

export const langchainDefaultChunkSizeInChars = (defaultLimit: number = 2000): number => {
  return parseInt(process.env.LANGCHAIN_DEFAULT_CHUNK_SIZE_IN_CHARS, 10) || defaultLimit;
};
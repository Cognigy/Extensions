export const getMaxChunkSize = (defaultLimit: number = 2000): number => {
  const parsed = parseInt(process.env.MAX_CHUNK_SIZE, 10);
  return isNaN(parsed) ? defaultLimit : parsed;
};

export const langchainDefaultChunkSizeInChars = (defaultLimit: number = 2000): number => {
  const parsed = parseInt(process.env.LANGCHAIN_DEFAULT_CHUNK_SIZE_IN_CHARS, 10);
  return isNaN(parsed) ? defaultLimit : parsed;
};
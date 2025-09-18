/* Node Modules */

import type { TiktokenEncoding, TiktokenModel } from "@dqbd/tiktoken";
import * as modelToEncoding from "@dqbd/tiktoken/model_to_encoding.json";
import {
  CharacterTextSplitter,
  type CharacterTextSplitterParams,
  TokenTextSplitter,
  type TokenTextSplitterParams,
} from "langchain/text_splitter";

// Max chunk size limit
const MAX_CHUNK_SIZE = 2000;

/**
 * This method resolves the proper encoding name for a given language model.
 * It's a helper function to find the proper encoding name for a model without looking it up.
 * The mapping comes from the "@dqbd/tiktoken" package, which is internally used by langchain
 *
 * @param modelName a tiktoken-compatible model name
 * @returns a tiktoken-compatible encoding name
 */
const getEncodingNameForModelName = (
  modelName: TiktokenModel,
): TiktokenEncoding => {
  const encodingName = modelToEncoding[modelName] as TiktokenEncoding;
  if (!encodingName) return null;
  return encodingName;
};

type ISimpleSplitOptions = Partial<TokenTextSplitterParams>;
const TokenSplitterDefaultOptions: ISimpleSplitOptions = {
  chunkSize: 512,
  chunkOverlap: 128,
  encodingName: getEncodingNameForModelName("gpt-3.5-turbo"),
};

const CharSplitDefaultOptions: Partial<CharacterTextSplitterParams> = {
  chunkSize: MAX_CHUNK_SIZE,
  chunkOverlap: 0,
};

/**
 * Splits a text into fixed-length chunks.
 *
 * First applies semantic splitting on Token level, then refines it using character level splitting
 * in case the chunks are still greater than the MAX_CHUNK_SIZE.
 *
 * @param text a string that should be split into chunks
 * @param options a set of options that should be passed to the TokenTextSplitter
 * @returns
 */
export const simpleSplit = async (
  text: string,
  options: ISimpleSplitOptions = {},
): Promise<string[]> => {
  const splitter = new TokenTextSplitter({
    ...TokenSplitterDefaultOptions,
    ...options,
  });
  const chunks = await splitter.splitText(text);
  const charSplitter = new CharacterTextSplitter({
    ...CharSplitDefaultOptions,
  });

  let refinedChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length > MAX_CHUNK_SIZE) {
      const smallerChunks = await charSplitter.splitText(chunk);
      refinedChunks = refinedChunks.concat(smallerChunks);
    } else {
      refinedChunks.push(chunk);
    }
  }
  return refinedChunks;
};

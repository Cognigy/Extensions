/* Node Modules */
import { TokenTextSplitter, TokenTextSplitterParams } from "langchain/text_splitter";
import * as modelToEncoding from '@dqbd/tiktoken/model_to_encoding.json';
import { TiktokenEncoding, TiktokenModel } from "@dqbd/tiktoken";

/**
 * This method resolves the proper encoding name for a given language model.
 * It's a helper function to find the proper encoding name for a model without looking it up.
 * The mapping comes from the "@dqbd/tiktoken" package, which is internally used by langchain
 *
 * @param modelName a tiktoken-compatible model name
 * @returns a tiktoken-compatible encoding name
 */
export const getEncodingNameForModelName = (modelName: TiktokenModel): TiktokenEncoding => {
    const encodingName = modelToEncoding[modelName] as TiktokenEncoding;

    if (!encodingName)
        return null;

    return encodingName;
}

interface ISimpleSplitOptions extends TokenTextSplitterParams {}

const defaultOptions: Partial<ISimpleSplitOptions> = {
    chunkSize: 1024,
    chunkOverlap: 128,
    encodingName: getEncodingNameForModelName('gpt-3.5-turbo')
}

/**
 * Splits a text into fixed-length chunks.
 *
 * Important: the "chunkSize" is measured in "tokens", not "characters"!
 *
 * Important: the tokens vary in size depending on the selected "encodingName"!
 * Make sure to select the correct encoding! The encoding has to fit the "Answer Extraction" model!
 *
 * This will produce chunks with character length < 2000 in case
 * the average word letter count stays below ~17 characters on average, therefore
 * we consider it "safe" to produce valid chunks.
 *
 * In case we run into that edge case, here's a proposed follow-up:
 * write a manual splitting function which takes both, the "character length"
 * and the "chunk length" limits into account.
 *
 * @param text a string that should be split into chunks
 * @param options a set of options that should be passed to the TokenTextSplitter
 * @returns
 */
export const simpleSplit = async (text: string, options: Partial<ISimpleSplitOptions> = {}): Promise<String[]> => {
    const splitter = new TokenTextSplitter({
        ...defaultOptions,
        ...options
    });

    return await splitter.splitText(text);
}
export const convertToUtf8 = async (filePath: string): Promise<string> => {
    // LangChain loaders handle encoding automatically
    // This function exists for compatibility but just returns the path
    return filePath;
};
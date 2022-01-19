export const stripEmpty = (data: object) => {
  const filtered = Object.entries(data).filter(([key, value]) => value !== '');
  return filtered.reduce((previous, [key, value]) => {
    return {
      ...previous,
      [key]: value,
    };
  }, {});
};

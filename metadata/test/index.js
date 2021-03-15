const Fuse = require('fuse.js');
const extensions = require('../extensions.json');

const parsedNodes = [];

extensions.extensions.forEach((extension) => {
    extension.nodes.forEach((node) => {
        parsedNodes.push({
            extension: extension.name,
            extensionLabel: extension.label,
            type: node.type,
	        defaultLabel: node.defaultLabel,
            description: node.description,
            tags: node.tags
        });
    });
});

const options = {
    includeScore: true,
    shouldSort: true,
    keys: [
      {
        name: 'extensionLabel',
        weight: 0.9
      },
      {
        name: 'defaulLabel',
        weight: 0.7
      },
      {
        name: 'description',
        weight: 0.5
      },
      {
        name: 'tags',
        weight: 0.7
      },
    ]
  }
  
  // Create a new instance of Fuse
  const fuse = new Fuse(parsedNodes, options)
  console.time("test");
  // Now search for 'Man'
  const result = fuse.search(process.argv[2]);

  console.log(result);
  console.timeEnd("test");
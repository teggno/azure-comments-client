export default function buildTree<
  TItem,
  TResultItem extends { children: TResultItem[] }
>(
  idAccessor: (item: TItem) => string,
  parentIdAccessor: (item: TItem) => string | null,
  resultItemFactory: (source?: TItem) => TResultItem,
  resultItemWriter: (source: TItem, target: TResultItem) => TResultItem,
  sourceList: TItem[]
): TResultItem[] {
  var dict: {
    [id: string]: { id: string; sourceItem?: TItem; resultItem: TResultItem };
  } = {};
  sourceList.forEach(src => {
    var id = idAccessor(src);
    var dictItem = dict[id];
    if (dictItem) {
      if (!dictItem.sourceItem) {
        dictItem.sourceItem = src;
        resultItemWriter(src, dictItem.resultItem);
      }
    } else {
      dictItem = dict[id] = {
        id: id,
        sourceItem: src,
        resultItem: resultItemWriter(src, resultItemFactory())
      };
    }
    var parentId = parentIdAccessor(src);
    if (parentId) {
      var parentDictItem = dict[parentId];
      if (!parentDictItem) {
        parentDictItem = dict[parentId] = {
          id: parentId,
          resultItem: resultItemFactory()
        };
      }
      parentDictItem.resultItem.children.push(dictItem.resultItem);
    }
  });
  var result: TResultItem[] = [];

  // dict contains an item of type TResultItem for each source item
  for (var id in dict) {
    var dictItem = dict[id];
    if (!dictItem.sourceItem) {
      throw new Error(
        `A non root item has ${
          dictItem.id
        } as parent id but that parent is missing in the input.`
      );
    }
    if (!parentIdAccessor(dictItem.sourceItem))
      result.push(dictItem.resultItem);
  }
  return result;
}

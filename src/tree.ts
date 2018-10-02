export default function buildTree<TItem>(
  idAccessor: (item: TItem) => string,
  parentIdAccessor: (item: TItem) => string | null,
  items: TItem[]
): Wrapper<TItem>[] {
  var dict: { [id: string]: InnerWrapper<TItem> } = {};
  items.forEach(item => {
    var id = idAccessor(item);
    var parentId = parentIdAccessor(item);
    var dictItem = dict[id];
    if (!dictItem) dictItem = dict[id] = { item: item, children: [] };
    if (parentId) {
      var parentDictItem = dict[parentId];
      if (!parentDictItem) parentDictItem = dict[parentId] = { children: [] };
      parentDictItem.children.push(dictItem);
    }
  });
  var result: InnerWrapper<TItem>[] = [];
  for (var id in dict) {
    var InnerWrapper = dict[id];
    if (!InnerWrapper.item && InnerWrapper.children[0]) {
      var firstChildItem = InnerWrapper.children[0].item;
      if (firstChildItem)
        throw new Error(
          `A non root item has ${parentIdAccessor(
            firstChildItem
          )} as parent id but that parent is missing in the input.`
        );
    }
    if (InnerWrapper.item && !parentIdAccessor(InnerWrapper.item))
      result.push({ item: InnerWrapper.item, children: InnerWrapper.children });
  }
  return <Wrapper<TItem>[]>result; // we can do this cast because we know that at this point there is no wrapper with an item that is undefined.
}

interface InnerWrapper<TItem> {
  item?: TItem;
  children: InnerWrapper<TItem>[];
}

interface Wrapper<TItem> {
  item: TItem;
  children: Wrapper<TItem>[];
}

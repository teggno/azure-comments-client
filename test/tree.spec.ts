import getTree from "../src/tree";
import { expect } from "chai";

describe("tree", () => {
  var input = [
    { id: "1", parentId: null },
    { id: "2", parentId: null },
    { id: "3", parentId: "2" },
    { id: "4", parentId: null },
    { id: "5", parentId: "3" }
  ];

  it("should return a list containing the root elements", () => {
    var result = getTree(item => item.id, item => item.parentId, input);

    var ids = result
      .map(i => (i.item ? parseInt(i.item.id) : 0))
      .sort((a, b) => a - b);
    expect(ids).to.eql([1, 2, 4]);
    // var item2 = result.filter(i => i.item.id === "2")[0];
    // expect(item2).to.have.property("children").with.lengthOf(1);
  });

  it("should build the branches", () => {
    var result = getTree(item => item.id, item => item.parentId, input);

    var item2 = result.filter(i => i.item && i.item.id === "2")[0];
    expect(item2)
      .to.have.property("children")
      .with.lengthOf(1);
    expect(item2.children[0])
      .to.have.property("children")
      .with.lengthOf(1);
    expect(item2.children[0].children[0].item.id).to.equal("5");
  });

  it("should throw if there is a child referencing a non existing parent", () => {
    var didFail = false;
    try {
      var result = getTree(item => item.id, item => item.parentId, [
        { id: "1", parentId: null },
        { id: "2", parentId: "7" }
      ]);
    } catch (e) {
      didFail = true;
    }
    expect(didFail).to.be.true;
  });
});

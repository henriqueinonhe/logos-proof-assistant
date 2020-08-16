import { LinkedList, LinkedListIterator, LinkedListNode } from "../../src/Utils/LinkedList";

//Linked List
describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {
    test("Empty list initialization", () =>
    {
      const list = new LinkedList<number>();
      expect(list.size()).toBe(0);
      expect(list["head"]).toBe(null);
      expect(list["last"]).toBe(null);
    });

    test("List is initialized properly", () =>
    {
      const list = new LinkedList<number>(2);
      expect(list.size()).toBe(1);
      expect(list["head"]!.data).toBe(2);
      expect(list["last"]!.data).toBe(2);
    });
  });
});

//Linked List Iterator
describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {
    test("Iterator is initialized properly", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      expect(iterator.getList()).toBe(list);
      expect(iterator["node"]?.data).toBe(10);
    });
  });
});

describe("get()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Iterator must be in a valid state", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator["node"] = null;
      expect(() => iterator.get()).toThrow("Iterator is invalid!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Returns element properly", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      expect(iterator.get()).toBe(10);
    });
  });
});

describe("set()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Iterator must be in a valid state", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator["node"] = null;
      expect(() => iterator.set(20)).toThrow("Iterator is invalid!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Returns element properly", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator.set(20);
      expect(iterator.get()).toBe(20);
    });
  });
});

describe("goToPrevious()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Iterator must be in a valid state", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator["node"] = null;
      expect(() => iterator.goToPrevious()).toThrow("Iterator is invalid!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Goes to previous node", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      list["head"]!.previous = new LinkedListNode(list, 20, null, list["head"]);
      iterator.goToPrevious();
      expect(iterator.get()).toBe(20);
    });
  });
});

describe("goToNext()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Iterator must be in a valid state", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator["node"] = null;
      expect(() => iterator.goToNext()).toThrow("Iterator is invalid!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Goes to next node", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      list["head"]!.next = new LinkedListNode(list, 20, list["head"], null);
      iterator.goToNext();
      expect(iterator.get()).toBe(20);
    });
  });
});

describe("clone()", () =>
{
  describe("Post Conditions", () =>
  {
    const list = new LinkedList<number>(10);
    const iterator = new LinkedListIterator<number>(list);
    const clone = iterator.clone();

    test("Iterator is properly cloned", () =>
    {
      expect(clone["node"]).toBe(iterator["node"]);
      expect(clone.getList()).toBe(iterator.getList());
    });

    test("Modifying clone doesn't affect original", () =>
    {
      clone["node"] = null;
      expect(iterator["node"]).not.toBe(null);
    });
  });
});

describe("isAtHead()", () =>
{
  describe("Post Conditions", () =>
  {
    test("False due to invalid iterator", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      iterator["node"] = null;
      expect(iterator.isAtHead()).toBe(false);
    });

    test("False due to not being at head", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertAfter(iterator, 20);
      expect(iterator.isAtHead()).toBe(false);
    });

    test("True", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      expect(iterator.isAtHead()).toBe(true);
    });
  });
});

describe("isAtLast()", () =>
{
  describe("Post Conditions", () =>
  {
    test("False due to invalid iterator", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      iterator["node"] = null;
      expect(iterator.isAtLast()).toBe(false);
    });

    test("False due to not being at last", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertBefore(iterator, 20);
      expect(iterator.isAtLast()).toBe(false);
    });

    test("True", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      expect(iterator.isAtLast()).toBe(true);
    });
  });
});

//Linked List
describe("insertAfter()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Iterator must be in a valid state", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator["node"] = null;
      expect(() => list.insertAfter(iterator, 20)).toThrow("Iterator is invalid!");
    });

    test("Iterator must refer to this list", () =>
    {
      const list = new LinkedList<number>(10);
      const otherList = new LinkedList(10);
      const iterator = new LinkedListIterator<number>(otherList);
      expect(() => list.insertAfter(iterator, 20)).toThrow("Passed iterator does not point to this list!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Element is inserted properly", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      list.insertAfter(iterator, 20);
      iterator.goToNext();
      
      expect(iterator.get()).toBe(20);
      expect(list.size()).toBe(2);
      expect(list["head"]!.data).toBe(10);
      expect(list["last"]!.data).toBe(20);

      iterator.goToPrevious();

      expect(iterator.get()).toBe(10); 
    });

    test("List with more than one element", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertAfter(iterator, 20);
      iterator = list.insertAfter(iterator, 30);
      expect(iterator.get()).toBe(30);
      expect(list.size()).toBe(3);

      iterator.goToPrevious();
      expect(iterator.get()).toBe(20);
      
      iterator.goToPrevious();
      expect(iterator.get()).toBe(10);
    });

    test("Inserting in element that is not the head nor the last", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertAfter(iterator, 20);
      iterator = list.insertAfter(iterator, 30);

      iterator.goToPrevious();
      iterator = list.insertAfter(iterator, 25);

      expect(iterator.get()).toBe(25);
      expect(list.size()).toBe(4);

      iterator.goToPrevious();
      expect(iterator.get()).toBe(20);

      iterator.goToNext();
      iterator.goToNext();
      expect(iterator.get()).toBe(30);
    });
  });
});

describe("insertBefore()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Iterator must be in a valid state", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator["node"] = null;
      expect(() => list.insertBefore(iterator, 20)).toThrow("Iterator is invalid!");
    });

    test("Iterator must refer to this list", () =>
    {
      const list = new LinkedList<number>(10);
      const otherList = new LinkedList(10);
      const iterator = new LinkedListIterator<number>(otherList);
      expect(() => list.insertBefore(iterator, 20)).toThrow("Passed iterator does not point to this list!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Element is inserted properly", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      list.insertBefore(iterator, 20);
      iterator.goToPrevious();

      expect(iterator.get()).toBe(20);
      expect(list.size()).toBe(2);
      expect(list["head"]!.data).toBe(20);
      expect(list["last"]?.data).toBe(10);

      iterator.goToNext();

      expect(iterator.get()).toBe(10); 
    });

    test("List with more than one element", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertBefore(iterator, 20);
      iterator = list.insertBefore(iterator, 30);
      expect(iterator.get()).toBe(30);
      expect(list.size()).toBe(3);

      iterator.goToNext();
      expect(iterator.get()).toBe(20);
      
      iterator.goToNext();
      expect(iterator.get()).toBe(10);
    });

    test("Inserting in element that is not the head nor the last", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertBefore(iterator, 20);
      iterator = list.insertBefore(iterator, 30);

      iterator.goToNext();
      iterator = list.insertBefore(iterator, 25);

      expect(iterator.get()).toBe(25);
      expect(list.size()).toBe(4);

      iterator.goToNext();
      expect(iterator.get()).toBe(20);

      iterator.goToPrevious();
      iterator.goToPrevious();
      expect(iterator.get()).toBe(30);
    });
  });
});

describe("remove()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Iterator must be in a valid state", () =>
    {
      const list = new LinkedList<number>(10);
      const iterator = new LinkedListIterator<number>(list);
      iterator["node"] = null;
      expect(() => list.remove(iterator)).toThrow("Iterator is invalid!");
    });

    test("Iterator must refer to this list", () =>
    {
      const list = new LinkedList<number>(10);
      const otherList = new LinkedList(10);
      const iterator = new LinkedListIterator<number>(otherList);
      expect(() => list.remove(iterator)).toThrow("Passed iterator does not point to this list!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Element is properly removed", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      list.insertAfter(iterator, 20);
      list.remove(iterator);

      expect(list.size()).toBe(1);
      expect(iterator.get()).toBe(20);
      expect(list["head"]?.data).toBe(20);
      expect(list["last"]?.data).toBe(20);
    });

    test("Removing element in the middle of the list (not head, not last)", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertAfter(iterator, 20);
      iterator = list.insertAfter(iterator, 30);
      iterator.goToPrevious();
      list.remove(iterator);

      const newIterator = new LinkedListIterator(list);
      expect(newIterator.get()).toBe(10);
      expect(newIterator.goToNext().get()).toBe(30);
    });

    test("Leaving list empty", () =>
    {
      const list = new LinkedList(10);
      const iterator = new LinkedListIterator(list);
      list.remove(iterator);
      expect(list.isEmpty());
    });
  });
});

describe("iteratorAt()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Index must be within bounds", () =>
    {
      const list = new LinkedList(10);
      expect(() => list.iteratorAt(2)).toThrow("associated with");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertAfter(iterator, 20);
      list.insertAfter(iterator, 30);
      const newIterator = list.iteratorAt(2);
      expect(newIterator.get()).toBe(30);
    });
  });
});

describe("at()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Index must be within bounds", () =>
    {
      const list = new LinkedList(10);
      expect(() => list.at(2)).toThrow("associated with");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      const list = new LinkedList(10);
      let iterator = new LinkedListIterator(list);
      iterator = list.insertAfter(iterator, 20);
      list.insertAfter(iterator, 30);
      expect(list.at(2)).toBe(30);
    });
  });
});


describe("swap()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("First iterator must refer to this list", () =>
    {
      const list = new LinkedList(10);
      const first = new LinkedListIterator(list);
      first["node"] = new LinkedList(10)["head"];
      const second = new LinkedListIterator(list);

      expect(() => list.swap(first, second)).toThrow("Passed iterator does not point to this list!");
    });

    test("First iterator must be in a valid state", () =>
    {
      const list = new LinkedList(10);
      const first = new LinkedListIterator(list);
      first["node"] = null;
      const second = new LinkedListIterator(list);

      expect(() => list.swap(first, second)).toThrow("Iterator is invalid!");
    });

    test("Second iterator must refer to this list", () =>
    {
      const list = new LinkedList(10);
      const first = new LinkedListIterator(list);
      const second = new LinkedListIterator(list);
      second["node"] = new LinkedList(10)["head"];

      expect(() => list.swap(first, second)).toThrow("Passed iterator does not point to this list!");
    });

    test("Second iterator must be in a valid state", () =>
    {
      const list = new LinkedList(10);
      const first = new LinkedListIterator(list);
      const second = new LinkedListIterator(list);
      second["node"] = null;

      expect(() => list.swap(first, second)).toThrow("Iterator is invalid!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy Path", () =>
    {
      const list = new LinkedList(10);
      const first = new LinkedListIterator(list);
      const temp = list.insertAfter(first, 20);
      const second = list.insertAfter(temp, 30);
      list.swap(first, second);
      expect(list.atHead()).toBe(30);
      expect(list.atLast()).toBe(10);
    });
  });
});

describe("isEmpty()", () =>
{
  describe("Post Conditions", () =>
  {
    test("True", () =>
    {
      expect(new LinkedList<number>().isEmpty()).toBe(true);
    });

    test("False", () =>
    {
      expect(new LinkedList(10).isEmpty()).toBe(false);
    });
  });
});

describe("atHead()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("List must not be emtpy", () =>
    {
      expect(() => new LinkedList<number>().atHead()).toThrow("list is empty!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(new LinkedList(10).atHead()).toBe(10);
    });
  });
});

describe("atLast()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("List must not be emtpy", () =>
    {
      expect(() => new LinkedList<number>().atLast()).toThrow("list is empty!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(new LinkedList(10).atLast()).toBe(10);
    });
  });
});

describe("iteratorAtHead()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(new LinkedList(10).iteratorAtHead().get()).toBe(10);
    });
  });
});

describe("iteratorAtLast()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(new LinkedList(10).iteratorAtLast().get()).toBe(10);
    });
  });
});

describe("push()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Empty list", () =>
    {
      const list = new LinkedList();
      list.push(10);

      expect(list.size()).toBe(1);
      expect(list.atHead()).toBe(10);
    });

    test("Non empty list", () =>
    {
      const list = new LinkedList(10);
      list.push(20);

      expect(list.size()).toBe(2);
      expect(list.atLast()).toBe(20);
    });
  });
});

describe("pop()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("List must not be empty", () =>
    {
      const list = new LinkedList();
      expect(() => list.pop()).toThrow("list is empty!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      const list = new LinkedList(20);
      list.push(30);
      expect(list.pop()).toBe(30);
      expect(list.atLast()).toBe(20);
    });
  });
});

describe("shift()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("List must not be empty", () =>
    {
      const list = new LinkedList();
      expect(() => list.shift()).toThrow("list is empty!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      const list = new LinkedList(10);
      list.push(20);
      expect(list.shift()).toBe(10);
      expect(list.atHead()).toBe(20);
    });
  });
});

describe("unshift()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Empty list", () =>
    {
      const list =  new LinkedList();
      list.unshift(10);
      expect(list.atHead()).toBe(10);
      expect(list.atLast()).toBe(10);
      expect(list.size()).toBe(1);
    });

    test("Non empty list", () =>
    {
      const list = new LinkedList(20);
      list.unshift(10);
      expect(list.atHead()).toBe(10);
      expect(list.atLast()).toBe(20);
    });
  });
});

describe("Iterator Protocol", () =>
{
  describe("Post Conditions", () =>
  {
    const list = new LinkedList(10);
    list.push(20);
    list.push(30);
    list.push(40);

    const numbers = [];
    for(const num of list)
    {
      numbers.push(num);
    }

    expect(numbers).toStrictEqual([10, 20, 30, 40]);
  });
});

// describe("clone", () =>
// {
//   describe("Post Conditions", () =>
//   {
//     test("List is cloned properly", () =>
//     {
//       const original = new LinkedList(10);
//       original.push(20);
//       original.push(30);

//       const clone = original.clone();

//       for(let index = 0; index < original.size(); index++)
//       {
//         expect(original.at(index)).toBe(clone.at(index));
//       }

//       expect(original).not.toBe(clone);
//     });

//     test("Modifying clone doesn't affect original", () =>
//     {
//       const original = new LinkedList({a : 10});
//       original.push({a : 20});
//       original.push({a : 30});

//       const clone = original.clone();
//     });
//   });
// });

describe("trasnferNodeAfter()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("sourceIterator must be valid and refer to this list", () =>
    {
      const source = new LinkedList(10);
      const target = new LinkedList(20);
      expect(() => source.transferNodeAfter(target.iteratorAtHead(), target, target.iteratorAtHead())).toThrow("Passed iterator does not point to this list!");
    });

    test("targetIterator must be valid and refer to target list", () =>
    {
      const source = new LinkedList(10);
      const target = new LinkedList(20);
      expect(() => source.transferNodeAfter(source.iteratorAtHead(), target, source.iteratorAtHead())).toThrow("Passed iterator does not point to this list!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Transfer is successfull", () =>
    {
      const source = new LinkedList(10);
      const target = new LinkedList(20);
      source.transferNodeAfter(source.iteratorAtHead(), target, target.iteratorAtHead());
      expect(source.isEmpty()).toBe(true);
      expect(source["length"]).toBe(0);
      expect(source["head"]).toBe(null);
      expect(source["last"]).toBe(null);

      expect(target.size()).toBe(2);
      expect(target["head"]?.data).toBe(20);
      expect(target["last"]?.data).toBe(10);
      expect(target["last"]!.list).toBe(target);
    });

    test("Iterators to transfered nodes remain valid", () =>
    {
      const source = new LinkedList(10);
      const target = new LinkedList(20);
      const iterator = source.iteratorAtHead();
      source.transferNodeAfter(source.iteratorAtHead(), target, target.iteratorAtHead());
      expect(iterator.get()).toBe(10);
      expect(iterator.getList()).toBe(target);
    });
  });
});
import { LogicErrorException, Utils } from "./LogosUtils";

/**
 * Represents a linked list node.
 * 
 * Acts mostly as a record that is used internally by linked lists
 * and linked lists iterators.
 * 
 */
export class LinkedListNode<T>
{
  /**
   * Constructs a [[LinkedListNode]].
   * 
   * Pre Conditions:
   * None
   * 
   * @param list
   * @param data 
   * @param previous 
   * @param next 
   */
  constructor(list : LinkedList<T>, data : T, previous : LinkedListNode<T> | null, next : LinkedListNode<T> | null)
  {
    this.list = list;
    this.data = data;
    this.previous = previous;
    this.next = next;
  }

  /**
   * Returns whether this node is valid, that is, 
   * if it belongs to a list.
   * Const.
   * 
   * Pre Conditions:
   * None
   */
  public isValid() : boolean
  {
    return this.list !== null;
  }

  /**
   * Returns whether this node is the last node in a list.
   * Const.
   * 
   * Pre Conditions:
   * None
   */
  public isLast() : boolean
  {
    this.checkValidity();
    return this.next === null;
  }

  /**
   * Returns whether this node is the first in a list.
   * Const.
   * 
   * Pre Conditions:
   * None
   */
  public isHead() : boolean
  {
    this.checkValidity();
    return this.previous === null;
  }

  private checkValidity() : void
  {
    if(!this.isValid())
    {
      throw new LogicErrorException("Node is not valid!");
    }
  }

  public list : LinkedList<T> | null;
  public data : T;
  public previous : LinkedListNode<T> | null;
  public next : LinkedListNode<T> | null;
}

/**
 * A [[LinkedList]] iterator.
 * 
 * Used for [[LinkedList]] traversal.
 * 
 */
export class LinkedListIterator<T>
{
  /**
   * Constructs a [[LinkedListIterator]].
   * 
   * Pre Conditions:
   * None
   * 
   * @param list 
   */
  constructor(list : LinkedList<T> | null)
  {
    if(list !== null)
    {
      this.node = list["head"]; //Friendship access
    }
    else
    {
      this.node = null;
    }
  }

  /**
   * Returns element that iterator currently points at.
   * Const.
   * 
   * Pre Conditions:
   * - Iterator must be in a valid state, that is, must be pointing
   * to an element.
   * 
   */
  public get() : T
  {
    this.checkValidity();

    return this.node!.data;
  }

  /**
   * Sets element that iterator currently points at.
   * Const.
   * 
   * Pre Conditions:
   * - Iterator must be in a valid state, that is, must be pointing
   * to an element.
   * 
   * @param data 
   */
  public set(data : T) : void
  {
    this.checkValidity();

    this.node!.data = data;
  }

  /**
   * Moves iterator to previous element.
   * Non-const.
   * 
   * Pre Conditions:
   * - Iterator must be in a valid state, that is, must be pointing
   * to an element.
   * 
   */
  public goToPrevious() : LinkedListIterator<T>
  {
    this.checkValidity();
    
    this.node = this.node!.previous as LinkedListNode<T>;
    return this;
  }

  /**
   * Moves iterator to next element and returns it.
   * Non-const.
   * 
   * Pre Conditions:
   * - Iterator must be in a valid state, that is, must be pointing
   * to an element.
   * 
   */
  public goToNext() : LinkedListIterator<T>
  {
    this.checkValidity();

    this.node = this.node!.next as LinkedListNode<T>;
    return this;
  }

  /**
   * Deep Copy.
   * Const.
   * 
   * Pre Conditions:
   * None
   */
  public clone() : LinkedListIterator<T>
  {
    const clone = new LinkedListIterator<T>(null);
    clone.node = this.node;

    return clone;
  }

  /**
   * Returns whether iterator is in a valid state, that is,
   * it is actually pointing to an element.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public isValid() : boolean
  {
    return this.node !== null && this.node.isValid();
  }

  private checkValidity() : void
  {
    if(!this.isValid())
    {
      throw new LogicErrorException("Iterator is invalid!");
    }
  }

  /**
   * Returns whether iterator is pointing at head.
   * If iterator is in an invalid state also returns false.
   * Const.
   * 
   * Pre Conditions:
   * None
   */
  public isAtHead() : boolean
  {
    return this.isValid() && this.node!.isHead();
  }

  /**
   * Returns whether iterator is pointing at last element.
   * If iterator is in an invalid state also returns false.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public isAtLast() : boolean
  {
    return this.isValid() && this.node!.isLast();
  }

  /**
   * Returns list iterator is associated with.
   * 
   * Pre Conditions:
   * - Iterator must be valid
   */
  public getList() : LinkedList<T>
  {
    this.checkValidity();

    return this.node!.list as LinkedList<T>;
  }

  private node : LinkedListNode<T> | null;
}

/**
 * Represents a (doubly) linked list.
 * 
 */
export class LinkedList<T>
{
  /**
   * Constructs a [[LinkedList]].
   * 
   * @param data 
   */
  constructor(data ?: T)
  {
    if(data !== undefined)
    {
      this.head = new LinkedListNode(this, data, null, null);
      this.last = this.head;
      this.length = 1;
    }
    else
    {
      this.head = null;
      this.last = null;
      this.length = 0;
    }
  }

  /**
   * Inserts an element after the element `iterator` points to and returns 
   * iterator to inserted element.
   * Non-const.
   * 
   * Pre Conditions:
   * - `iterator` must refer to this list.
   * - `iterator` must be in a valid state.
   * 
   * @param iterator 
   * @param data 
   */
  public insertAfter(iterator : LinkedListIterator<T>, data : T) : LinkedListIterator<T>
  {
    this.checkIteratorValidity(iterator);

    const beforeInsertedNode = iterator["node"]; //Friendship access
    const afterInsertedNode = iterator["node"]!.next;
    const insertedNode = new LinkedListNode<T>(this, data, beforeInsertedNode, afterInsertedNode);
    
    if(beforeInsertedNode!.isLast())
    {
      this.last = insertedNode;
    }
    else
    {
      afterInsertedNode!.previous = insertedNode;
    }

    beforeInsertedNode!.next = insertedNode;
    
    
    this.length++;

    const returnIterator = iterator.clone();
    returnIterator.goToNext();
    return returnIterator;
  }

  /**
   * Inserts an element before the element `iterator` points to and returns
   * interator to inserted element.
   * Non-const.
   * 
   * Pre Conditions:
   * - `iterator` must refer to this list.
   * - `iterator` must be in a valid state.
   * 
   * @param iterator 
   * @param data 
   */
  public insertBefore(iterator : LinkedListIterator<T>, data : T) : LinkedListIterator<T>
  {
    this.checkIteratorValidity(iterator);

    const currentNode = iterator["node"]; //Friendship access
    const beforeInsertedNode = currentNode!.previous;
    const insertedNode = new LinkedListNode<T>(this, data, beforeInsertedNode, currentNode);
    if(currentNode!.isHead())
    {
      this.head = insertedNode;
    }
    else
    {
      beforeInsertedNode!.next = insertedNode;
    }
    currentNode!.previous = insertedNode;

    this.length++;

    const returnIterator = iterator.clone();
    returnIterator.goToPrevious();
    return returnIterator;
  }

  /**
   * Removes element `iterator` points to and returns iterator to element
   * after the removed element.
   * Non-const.
   * 
   * Pre Conditions:
   * - `iterator` must refer to this list.
   * - `iterator` must be in a valid state.
   * 
   * @param iterator 
   */
  public remove(iterator : LinkedListIterator<T>) : LinkedListIterator<T>
  {
    this.checkIteratorValidity(iterator);

    const removedNode = iterator["node"]; //Friendship access
    const beforeRemovedNode = removedNode!.previous;
    const afterRemovedNode = removedNode!.next;

    //List Nodes
    if(removedNode!.isHead())
    {
      this.head = afterRemovedNode;
    }
    else
    {
      beforeRemovedNode!.next = afterRemovedNode;
    }

    if(removedNode!.isLast())
    {
      this.last = beforeRemovedNode;
    }
    else
    {
      afterRemovedNode!.previous = beforeRemovedNode;
    }

    this.length--;

    removedNode!.next = null;
    removedNode!.previous = null;
    removedNode!.list = null;

    const returnIterator = iterator.clone();
    returnIterator["node"] = afterRemovedNode;
    return returnIterator;
  }

  /**
   * Returns list length.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public size() : number
  {
    return this.length;
  }

  /**
   * Returns iterator at `index`.
   * Const.
   * 
   * Pre Conditions:
   * - `index` must be within bounds.
   * 
   * @param index 
   */
  public iteratorAt(index : number) : LinkedListIterator<T>
  {
    Utils.validateIndex(index, "index", this.length + 1, "this"); //Considering one after last element

    const iterator = new LinkedListIterator<T>(this);
    for(let count = 0; count < index; count++)
    {
      iterator.goToNext();
    }
    return iterator;
  }

  /**
   * Returns element at `index`.
   * Const.
   * 
   * Pre Conditions:
   * - `index` must be within bounds.
   * 
   * @param index 
   */
  public at(index : number) : T
  {
    Utils.validateIndex(index, "index", this.length, "this");

    const iterator = this.iteratorAt(index);
    return iterator.get();
  }
  
  /**
   * Swaps elements pointed by iterators.
   * Non-const.
   * 
   * Pre Conditions:
   * - Iterators must refer to this list.
   * - Iterators must be in a valid state.
   * 
   * @param first 
   * @param second 
   */
  public swap(first : LinkedListIterator<T>, second : LinkedListIterator<T>) : void
  {
    this.checkIteratorValidity(first);
    this.checkIteratorValidity(second);

    const firstData = first.get();
    const secondData = second.get();
    first.set(secondData);
    second.set(firstData);
  }

  private checkIteratorValidity(iterator : LinkedListIterator<T>) : void
  {
    iterator["checkValidity"]();

    if(iterator.getList() !== this)
    {
      throw new LogicErrorException("Passed iterator does not point to this list!");
    }
  }

  /**
   * Returns whether list is empty.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public isEmpty() : boolean
  {
    return this.head === null;
  }

  /**
   * Returns element that is at head.
   * Const.
   * 
   * Pre Conditions:
   * - List must not be empty.
   * 
   */
  public atHead() : T
  {
    if(this.isEmpty())
    {
      throw new LogicErrorException("There is no element at head as list is empty!");
    }

    return this.head!.data;
  }

  /**
   * Returns last element.
   * Const.
   * 
   * Pre Conditions:
   * - List must not be empty.
   * 
   */
  public atLast() : T
  {
    if(this.isEmpty())
    {
      throw new LogicErrorException("There is no last element as list is empty!");
    }

    return this.last!.data;
  }

  /**
   * Returns an iterator pointing at head.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public iteratorAtHead() : LinkedListIterator<T>
  {
    return new LinkedListIterator(this);
  }

  /**
   * Returns an iterator pointing at last.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public iteratorAtLast() : LinkedListIterator<T>
  {
    const iterator = new LinkedListIterator(this);
    iterator["node"] = this.last;
    return iterator;
  }

  /**
   * Pushes element to the list.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * @param data 
   */
  public push(data : T) : void
  {
    if(this.isEmpty())
    {
      this.head = new LinkedListNode(this, data, null, null);
      this.last = this.head;
      this.length = 1;
    }
    else
    {
      const iteratorAtLast = this.iteratorAtLast();
      this.insertAfter(iteratorAtLast, data);
    }
  }

  /**
   * Pops last element and returns it.
   * Non-const.
   * 
   * Pre Conditions:
   * - List must not be empty.
   */
  public pop() : T
  {
    if(this.isEmpty())
    {
      throw new LogicErrorException("Cannot pop element as list is empty!");
    }

    const iteratorAtLast = this.iteratorAtLast();
    const poppedElement = iteratorAtLast.get();
    this.remove(iteratorAtLast);
    return poppedElement;
  }

  /**
   * Shifts first element and returns it.
   * Non-const.
   * 
   * Pre Conditions:
   * - List must not be empty.
   */
  public shift() : T
  {
    if(this.isEmpty())
    {
      throw new LogicErrorException("Cannot shift element as list is empty!");
    }

    const iteratorAtHead = this.iteratorAtHead();
    const shiftedElement = iteratorAtHead.get();
    this.remove(iteratorAtHead);
    return shiftedElement;
  }

  /**
   * Unshifts element at head position.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * @param data 
   */
  public unshift(data : T) : void
  {
    if(this.isEmpty())
    {
      this.head = new LinkedListNode<T>(this, data, null, null);
      this.last = this.head;
      this.length = 1;
    }
    else
    {
      const iteratorAtHead = this.iteratorAtHead();
      this.insertBefore(iteratorAtHead, data);
    }
  }

  *[Symbol.iterator]() : Iterator<T>
  {
    const iterator = new LinkedListIterator(this);
    while(iterator.isValid())
    {
      yield iterator.get();
      iterator.goToNext();
    }
  }

  /**
   * Deep Copy
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  // public clone() : LinkedList<T>
  // {
  //   const clonedList = new LinkedList<T>();
  //   for(const element of this)
  //   {
  //     clonedList.push(element); //This is an issue! Element must be cloneable!
  //   }
  //   return clonedList;
  // }

  public map<MappedType>(callback : (element : T, index ?: number, list ?: LinkedList<T>) => MappedType) : LinkedList<MappedType>
  {
    const mappedList = new LinkedList<MappedType>();
    let index = 0;
    for(const element of this)
    {
      mappedList.push(callback(element, index, this));
      index++;
    }
    return mappedList;
  }

  /**
   * Shallow copy of the list to an array.
   * Const.
   * 
   * Pre Conditions: 
   * None
   */
  public toArray() : Array<T>
  {
    const array = [];
    for(const element of this)
    {
      array.push(element);
    }
    return array;
  }

  /**
   * Transfers a given node from this list to target list
   * after the node `targetListIterator` points to.
   * 
   * This method doesn't invalidate/move iterators pointing
   * at the transfered node.
   * Non-const.
   * 
   * @param sourceListIterator 
   * @param targetList 
   * @param targetListIterator 
   */
  public transferNodeAfter(sourceListIterator : LinkedListIterator<T>, targetList : LinkedList<T>, targetListIterator : LinkedListIterator<T>) : LinkedListIterator<T>
  {
    this.checkIteratorValidity(sourceListIterator);
    targetList.checkIteratorValidity(targetListIterator);

    //Remove Node From This List
    const returnedIterator = this.remove(sourceListIterator);

    //Insert Node At Target List
    const transferedNode = sourceListIterator["node"];
    transferedNode!.list = targetList; //Transfering node ownership to new list
    const beforeInsertedNode = targetListIterator["node"]; //Friendship access
    const afterInsertedNode = targetListIterator["node"]!.next; //Friendship access

    
    if(beforeInsertedNode!.isLast())
    {
      targetList.last = transferedNode;
    }
    else
    {
      afterInsertedNode!.previous = transferedNode;
    }

    transferedNode!.next = afterInsertedNode;
    transferedNode!.previous = beforeInsertedNode;
    beforeInsertedNode!.next = transferedNode;
    
    targetList.length++;
    return returnedIterator;
  }

  /**
   * Transfers a given node from this list to target list
   * before the node `targetListIterator` points to.
   * 
   * This method doesn't invalidate/move iterators pointing
   * at the transfered node.
   * Non-const.
   * 
   * @param sourceListIterator 
   * @param targetList 
   * @param targetListIterator 
   */
  public transferNodeBefore(sourceListIterator : LinkedListIterator<T>, targetList : LinkedList<T>, targetListIterator : LinkedListIterator<T>) : LinkedListIterator<T>
  {
    this.checkIteratorValidity(sourceListIterator);
    targetList.checkIteratorValidity(targetListIterator);

    const transferedNode = sourceListIterator["node"];
    const returnedIterator = this.remove(sourceListIterator);

    //Insert Node At Target List
    transferedNode!.list = targetList; //Transfering node ownership to new list
    const afterInsertedNode = targetListIterator["node"]; //Friendship access
    const beforeInsertedNode = targetListIterator["node"]!.previous;
    const insertedNode = transferedNode;

    if(afterInsertedNode!.isHead())
    {
      targetList.head = insertedNode;
    }
    else
    {
      beforeInsertedNode!.next = insertedNode;
    }
    transferedNode!.previous = beforeInsertedNode;
    transferedNode!.next = afterInsertedNode;
    afterInsertedNode!.previous = insertedNode;

    targetList.length++;

    return returnedIterator;
  }

  public transferNodeToEnd(sourceListIterator : LinkedListIterator<T>, targetList : LinkedList<T>) : LinkedListIterator<T>
  {
    this.checkIteratorValidity(sourceListIterator);

    const returnedIterator = this.remove(sourceListIterator);

    //Insert Node At Target List
    const transferedNode = sourceListIterator["node"];
    transferedNode!.next = null;
    transferedNode!.list = targetList; //Transfering node ownership to new list
    if(targetList.isEmpty())
    {
      targetList.head = transferedNode;
      targetList.last = targetList.head;
      targetList.length = 1;
    }
    else
    {
      const beforeInsertedNode = targetList.iteratorAtLast()["node"]; //Friendship access
      targetList.last = transferedNode;
      transferedNode!.previous = beforeInsertedNode;
      beforeInsertedNode!.next = transferedNode;
    
      targetList.length++;
    }

    return returnedIterator;
  }

  public transferNodeToBegin(sourceListIterator : LinkedListIterator<T>, targetList : LinkedList<T>) : LinkedListIterator<T>
  {
    this.checkIteratorValidity(sourceListIterator);

    const returnedIterator = this.remove(sourceListIterator);

    //Insert Node At Target List
    const transferedNode = sourceListIterator["node"];
    transferedNode!.previous = null;
    transferedNode!.list = targetList; //Transfering node ownership to new list
    if(targetList.isEmpty())
    {
      transferedNode!.next = null;
      targetList.head = transferedNode;
      targetList.last = transferedNode;
      targetList.length = 1;
    }
    else
    {
      const afterInsertedNode = targetList.iteratorAtHead()["node"]; //Friendship access
      targetList.head = transferedNode;
      afterInsertedNode!.previous = transferedNode;
      transferedNode!.next = afterInsertedNode;
    
      targetList.length++;
    }

    return returnedIterator;
  }

  private head : LinkedListNode<T> | null;
  private last : LinkedListNode<T> | null;
  private length : number;
}


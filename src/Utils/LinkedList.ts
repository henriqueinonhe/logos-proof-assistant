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
   * @param data 
   * @param previous 
   * @param next 
   */
  constructor(data : T, previous : LinkedListNode<T> | null, next : LinkedListNode<T> | null)
  {
    this.data = data;
    this.previous = previous;
    this.next = next;
  }

  /**
   * Checks whether this node is head on the list.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public isHead() : boolean
  {
    return this.previous === null;
  }

  /**
   * Checks whether this node is last on the list.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   */
  public isLast() : boolean
  {
    return this.next === null;
  }

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
  constructor(list : LinkedList<T>)
  {
    this.list = list;
    this.node = list["head"]; //Friendship access
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
   * - There must be a previous element to go to.
   * 
   */
  public goToPrevious() : LinkedListIterator<T>
  {
    this.checkValidity();
    
    if(this.node!.isHead())
    {
      throw new LogicErrorException("Cannot go to previous node as current node is head!");
    }

    this.node = this.node!.previous as LinkedListNode<T>;
    return this;
  }

  /**
   * Moves iterator to next element.
   * Non-const.
   * 
   * Pre Conditions:
   * - Iterator must be in a valid state, that is, must be pointing
   * to an element.
   * - There must a next element to go to.
   * 
   */
  public goToNext() : LinkedListIterator<T>
  {
    this.checkValidity();

    if(this.node!.isLast())
    {
      throw new LogicErrorException("Cannot go to next node as current node is last node!");
    }

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
    const clone = new LinkedListIterator<T>(this.list);
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
    return this.node !== null;
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

  private list : LinkedList<T>;
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
      this.head = new LinkedListNode(data, null, null);
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

    const currentNode = iterator["node"]; //Friendship access
    const afterInsertedNode = currentNode!.next;
    const insertedNode = new LinkedListNode<T>(data, currentNode, afterInsertedNode);
    if(currentNode!.isLast())
    {
      this.last = insertedNode;
    }
    else
    {
      afterInsertedNode!.previous = insertedNode;
    }
    currentNode!.next = insertedNode;

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
    const insertedNode = new LinkedListNode<T>(data, beforeInsertedNode, currentNode);
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

    const currentNode = iterator["node"]; //Friendship access
    const previousNode = currentNode!.previous;
    const nextNode = currentNode!.next;

    if(currentNode!.isHead())
    {
      this.head = nextNode;
    }
    else
    {
      previousNode!.next = nextNode;
    }

    if(currentNode!.isLast())
    {
      this.last = previousNode;
    }
    else
    {
      nextNode!.previous = previousNode;
    }

    this.length--;

    iterator["node"] = nextNode;
    return iterator;
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
    Utils.validateIndex(index, "index", this.length, "this");

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
    if(iterator["list"] !== this)
    {
      throw new LogicErrorException("Passed iterator does not point to this list!");
    }
    
    iterator["checkValidity"]();
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
      this.head = new LinkedListNode(data, null, null);
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
      this.head = new LinkedListNode<T>(data, null, null);
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
    while(!iterator.isAtLast())
    {
      yield iterator.get();
      iterator.goToNext();
    }
    yield iterator.get();
  }

  private head : LinkedListNode<T> | null;
  private last : LinkedListNode<T> | null;
  private length : number;
}


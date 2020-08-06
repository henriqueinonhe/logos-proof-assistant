// import { TypeTokenString } from "./TypeTokenString";
// import { TypeToken, TypeTokenSort } from "./TypeToken";
// import { InvalidArgumentException } from "./LogosUtils";

/* Right now this will be postponed */

// class TypeTokenWrapper
// {
//   constructor(token : TypeToken, previous : TypeTokenWrapper | null, next : TypeTokenWrapper | null)
//   {
//     this.token = token;
//     this.previous = previous;
//     this.next = next;
//   }

//   public isFirst() : boolean
//   {
//     return this.previous === null;
//   }

//   public isLast() : boolean
//   {
//     return this.next === null;
//   }

//   public token : TypeToken;
//   public previous : TypeTokenWrapper | null;
//   public next : TypeTokenWrapper | null;
// }

// class RoundBracketTokenWrapper extends TypeTokenWrapper
// {
//   constructor(token : TypeToken, previous : TypeTokenWrapper | null, next : TypeTokenWrapper | null)
//   {
//     super(token, previous, next);
//   }

//   public matchedBracket : RoundBracketTokenWrapper | undefined;
// }

// class TypeTokenWrapperFactory
// {
//   public static createTypeTokenWrapper(token : TypeToken) : TypeTokenWrapper
//   {
//     if(token.getSort() === TypeTokenSort.LeftRoundBracket ||
//        token.getSort() === TypeTokenSort.RightRoundBracket)
//     {
//       return new RoundBracketTokenWrapper(token, null, null);
//     }
//     else
//     {
//       return new TypeTokenWrapper(token, null, null);
//     }
//   }
// }

// class TypeTokenWrapperList
// {
//   constructor(tokenList : Array<TypeToken>)
//   {
//     const tokenListIsEmpty = tokenList.length === 0;
//     if(tokenListIsEmpty)
//     {
//       throw new InvalidArgumentException("Token list cannot be empty!");
//     }

//     //Fill List
//     const firstToken = tokenList[0];
//     const leftRoundBracketList = [];
//     const rightRoundBracketList = [];

//     this.firstToken = TypeTokenWrapperFactory.createTypeTokenWrapper(firstToken);
//     if(firstToken.getSort() === TypeTokenSort.LeftRoundBracket)
//     {
//       leftRoundBracketList.push(this.firstToken);
//     }
//     else if(firstToken.getSort() === TypeTokenSort.RightRoundBracket)
//     {
//       rightRoundBracketList.unshift(this.firstToken);
//     }

//     let currentTokenWrapper = this.firstToken;
//     for(let index = 1; index < tokenList.length; index++)
//     {
//       const currentToken = tokenList[index];
//       const nextTokenWrapper = TypeTokenWrapperFactory.createTypeTokenWrapper(currentToken);
//       if(firstToken.getSort() === TypeTokenSort.LeftRoundBracket)
//       {
//         leftRoundBracketList.push(nextTokenWrapper);
//       }
//       else if(firstToken.getSort() === TypeTokenSort.RightRoundBracket)
//       {
//         rightRoundBracketList.unshift(nextTokenWrapper);
//       }
//       currentTokenWrapper.next = nextTokenWrapper;
//       nextTokenWrapper.previous = currentTokenWrapper;
//       currentTokenWrapper = nextTokenWrapper;
//     }

//     //Bracket Matching
//   }

//   public getFirstToken() : TypeTokenWrapper
//   {
//     return this.firstToken;
//   }

//   public toTypeTokenString() : TypeTokenString
//   {
//     const tokenList = [];
//     let currentToken : TypeTokenWrapper | null = this.firstToken;
//     while(currentToken !== null)
//     {
//       tokenList.push(currentToken.token);
//       currentToken = currentToken.next;
//     }
//     return new TypeTokenString(tokenList.map(token => token.toString()).join(" "));
//   }

//   private firstToken : TypeTokenWrapper;
// }

// class TypeTokenWrapperIterator
// {
//   constructor(list : TypeTokenWrapperList)
//   {
//     this.currentToken = list.getFirstToken();
//   }

//   public token() : TypeTokenWrapper
//   {
//     return this.currentToken;
//   }

//   public insertAfter(insertedToken : TypeTokenWrapper) : TypeTokenWrapperIterator
//   {
//     const oldNextToken = this.currentToken.next;
//     if(oldNextToken !== null)
//     {
//       insertedToken.next = oldNextToken;
//       oldNextToken.previous = insertedToken;
//     }
//     insertedToken.previous = this.currentToken;
//     this.currentToken.next = insertedToken;

//     return this;
//   }

//   public insertBefore(insertedToken : TypeTokenWrapper) : TypeTokenWrapperIterator
//   {
//     const oldPreviousToken = this.currentToken.previous;
//     if(oldPreviousToken !== null)
//     {
//       oldPreviousToken.next = insertedToken;
//       insertedToken.previous = oldPreviousToken;
//     }
//     insertedToken.next = this.currentToken;
//     this.currentToken.previous = insertedToken;

//     return this;
//   }

//   public goToNext() : TypeTokenWrapperIterator
//   {
//     if(this.currentToken.isLast())
//     {
//       throw new InvalidArgumentException("There is no next token!");
//     }

//     this.currentToken = this.currentToken.next as TypeTokenWrapper;
//     return this;
//   }

//   public goToPrevious() : TypeTokenWrapperIterator
//   {
//     if(this.currentToken.isFirst())
//     {
//       throw new InvalidArgumentException("There is no previous token!");
//     }

//     this.currentToken = this.currentToken.previous as TypeTokenWrapper;
//     return this;
//   }

//   public goToMatchingRoundBracket() : TypeTokenWrapperIterator
//   {
//     if(!(this.currentToken instanceof RoundBracketTokenWrapper))
//     {
//       throw new InvalidArgumentException("Current token is not an instance of RoundBracketTokenWrapper!");
//     }
    
//     if((this.currentToken as RoundBracketTokenWrapper).matchedBracket === undefined)
//     {
//       throw new InvalidArgumentException("Current token's matched bracket is undefined!");
//     }

//     this.currentToken = this.currentToken.matchedBracket as TypeTokenWrapper;
//     return this;
//   }

//   private currentToken : TypeTokenWrapper;
// }

// export class TypeParserPreProcessor
// {
//   public static process(string : string) : string
//   {
//     const typeString = new TypeTokenString(string);
//     const tokenList = typeString.getTokenList();
//     const wrappedTokenList = new TypeTokenWrapperList()
//   }
// }

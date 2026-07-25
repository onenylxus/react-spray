import { Trie } from '../src/trie';
import { randint, randnum, randstr, randstrs } from './fixtures/random';

describe('constructor', () => {
  it('Case 1: empty root node', () => {
    const trie = new Trie<number>();
    expect(trie).toBeInstanceOf(Trie);
    expect(trie.search([])).toBeNull();
  });

  it('Case 2: root node with value', () => {
    const num = randnum();

    const trie = new Trie<number>(num);
    expect(trie).toBeInstanceOf(Trie);
    expect(trie.search([])).toStrictEqual(num);
  });
});

describe('search', () => {
  it('Case 1: valid search', () => {
    const str = randstr();
    const obj = { [randstr()]: randnum() };

    const trie = new Trie<Record<string, number>>();
    trie.insert([str], obj);
    expect(trie.search([str])).toStrictEqual(obj);
  });

  it('Case 2: invalid search', () => {
    const trie = new Trie<unknown>();
    expect(trie.search([randstr()])).toBeNull();
  });
});

describe('insert', () => {
  it('Case 1: single layer', () => {
    const str = randstr();
    const num = randnum();

    const trie = new Trie<number>();
    const result = trie.insert([str], num);
    expect(result).toStrictEqual(true);
    expect(trie.search([str])).toStrictEqual(num);
  });

  it('Case 2: multiple layers', () => {
    const strs = randstrs(randint(2, 8));
    const num = randnum();

    const trie = new Trie<number>();
    const result = trie.insert(strs, num);
    expect(result).toStrictEqual(true);
    for (let i = 1; i < strs.length; i++) {
      expect(trie.search(strs.slice(0, i))).toBeNull();
    }
    expect(trie.search(strs)).toStrictEqual(num);
  });

  it('Case 3: overwrite', () => {
    const str = randstr();
    const num1 = randnum();
    const num2 = randnum();

    const trie = new Trie<number>();
    trie.insert([str], num1);
    const result = trie.insert([str], num2);
    expect(result).toStrictEqual(true);
    expect(trie.search([str])).toStrictEqual(num2);
  });

  it('Case 4: inner overlap', () => {
    const strs = randstrs(randint(2, 8));
    const num1 = randnum();
    const num2 = randnum();

    const trie = new Trie<number>();
    trie.insert(strs, num1);
    const result = trie.insert([strs[0]], num2);
    expect(result).toStrictEqual(true);
    expect(trie.search([strs[0]])).toStrictEqual(num2);
    expect(trie.search(strs)).toStrictEqual(num1);
  });

  it('Case 5: outer overlap', () => {
    const strs = randstrs(randint(2, 8));
    const num1 = randnum();
    const num2 = randnum();

    const trie = new Trie<number>();
    trie.insert([strs[0]], num1);
    const result = trie.insert(strs, num2);
    expect(result).toStrictEqual(true);
    expect(trie.search(strs)).toStrictEqual(num2);
    expect(trie.search([strs[0]])).toStrictEqual(num1);
  });
});

describe('remove', () => {
  it('Case 1: simple remove', () => {
    const str = randstr();
    const num = randnum();

    const trie = new Trie<number>();
    trie.insert([str], num);
    trie.remove([str]);
    expect(trie.search([str])).toBeNull();
  });

  it('Case 2: inner overlap', () => {
    const strs = randstrs(randint(2, 8));
    const num1 = randnum();
    const num2 = randnum();

    const trie = new Trie<number>();
    trie.insert(strs, num1);
    trie.insert([strs[0]], num2);
    trie.remove(strs);
    expect(trie.search(strs)).toBeNull();
    expect(trie.search([strs[0]])).toStrictEqual(num2);
  });

  it('Case 3: outer overlap', () => {
    const strs = randstrs(randint(2, 8));
    const num1 = randnum();
    const num2 = randnum();

    const trie = new Trie<number>();
    trie.insert([strs[0]], num1);
    trie.insert(strs, num2);
    trie.remove([strs[0]]);
    expect(trie.search([strs[0]])).toBeNull();
    expect(trie.search(strs)).toStrictEqual(num2);
  });

  it('Case 4: invalid remove', () => {
    const str = randstr();

    const trie = new Trie<number>();
    const result = trie.remove([str]);
    expect(result).toStrictEqual(false);
  });
});

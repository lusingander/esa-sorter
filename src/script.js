const sortKeyTitleAsc = "タイトル 昇順";
const sortKeyTitleDesc = "タイトル 降順";
const sortKeyCountAsc = "記事数 昇順";
const sortKeyCountDesc = "記事数 降順";
const sortKeyUserCustom = "カスタム";

const liSorterTitleAsc = (a, b) => {
  if (a.title < b.title) {
    return -1;
  } else if (a.title > b.title) {
    return 1;
  }
  return 0;
};
const liSorterTitleDesc = (a, b) => -1 * liSorterTitleAsc(a, b);
const liSorterCountAsc = (a, b) => a.count - b.count;
const liSorterCountDesc = (a, b) => -1 * liSorterCountAsc(a, b);

const getTitleFromLi = (li) =>
  li.querySelector("span.title > span.navbar-side__title-name").innerHTML;

class SortState {
  constructor(ul, userData) {
    this.ul = ul;
    this.userData = userData;
  }
  enter() {}
  exit() {}
  sorter() {}
  keyStr() {}
  nextState(oldState, newState) {
    oldState.exit();
    newState.enter();
    return newState;
  }
}

class SortTitleAscState extends SortState {
  constructor(ul, userData) { super(ul, userData); }
  nextState() { return super.nextState(this, new SortTitleDescState(this.ul, this.userData)); }
  sorter() { return liSorterTitleAsc; }
  keyStr() { return sortKeyTitleAsc; }
}

class SortTitleDescState extends SortState {
  constructor(ul, userData) { super(ul, userData); }
  nextState() { return super.nextState(this, new SortCountAscState(this.ul, this.userData)); }
  sorter() { return liSorterTitleDesc; }
  keyStr() { return sortKeyTitleDesc; }
}

class SortCountAscState extends SortState {
  constructor(ul, userData) { super(ul, userData); }
  nextState() { return super.nextState(this, new SortCountDescState(this.ul, this.userData)); }
  sorter() { return liSorterCountAsc; }
  keyStr() { return sortKeyCountAsc; }
}

class SortCountDescState extends SortState {
  constructor(ul, userData) { super(ul, userData); }
  nextState() { return super.nextState(this, new SortUserCustomState(this.ul, this.userData)); }
  sorter() { return liSorterCountDesc; }
  keyStr() { return sortKeyCountDesc; }
}

class SortUserCustomState extends SortState {
  constructor(ul, userData) {
    super(ul, userData);
    this.sortable = null;
  }
  nextState() { return super.nextState(this, new SortTitleAscState(this.ul, this.userData)); }
  sorter() {
    if ("custom-order" in this.userData) {
      const order = this.userData["custom-order"];
      return (a, b) => {
        const ai = order[a.title] || 99999; // FIX
        const bi = order[b.title] || 99999;
        if (ai < bi) return -1;
        if (ai > bi) return 1;
        return 0;
      };
    }
    return (a, b) => 0;
  }
  keyStr() { return sortKeyUserCustom; }
  enter() {
    this.sortable = Sortable.create(this.ul, {
      group: "esa-categories",
      animation: 150,
      onUpdate: (evt) => {
        const data = [].slice
          .call(this.ul.querySelectorAll("li"))
          .map((li, i) => ({title: getTitleFromLi(li), index: i + 1})) // (0 || n) => n
          .reduce((map, obj) => {
            map[obj.title] = obj.index;
            return map;
          }, {})
        chrome.storage.local.set({"custom-order": data});
        this.userData["custom-order"] = data;
      }
    });
  }
  exit() {
    this.sortable.destroy();
    this.sortable = null;
  }
}

const exec = async () => {
  const nav = document.querySelector("nav.navbar-side");
  if (nav === null) return;
  const ul = nav.querySelector("ul");
  if (ul === null) return;
  const lis = ul.querySelectorAll("li");

  const userData = await new Promise(resolve => {
    chrome.storage.local.get("custom-order", items => { resolve(items) });
  });

  const sort = sorter => {
    [].slice
      .call(lis)
      .map(li => ({
        li: li,
        title: getTitleFromLi(li),
        count: Number(li.querySelector("span.count-num").innerHTML)
      }))
      .sort(sorter)
      .forEach(li => {
        ul.appendChild(li.li);
      });
  };

  const keySelectorElem = document.createElement("div");
  keySelectorElem.setAttribute("id", "esa-sorter-key-selector");
  const sortIconElem = document.createElement("i");
  sortIconElem.setAttribute("id", "esa-sorter-sort-icon");
  sortIconElem.setAttribute(
    "class",
    "fa fa-sort-amount-desc search__sort-icon"
  );
  const sortKeyTextElem = document.createElement("div");
  sortKeyTextElem.appendChild(document.createTextNode(sortKeyTitleAsc));
  let currentState = new SortTitleAscState(ul, userData);
  keySelectorElem.addEventListener("click", e => {
    currentState = currentState.nextState(ul, userData);
    sort(currentState.sorter());
    sortKeyTextElem.textContent = currentState.keyStr();
  });
  keySelectorElem.appendChild(sortIconElem);
  keySelectorElem.appendChild(sortKeyTextElem);
  nav.insertBefore(keySelectorElem, ul);

  sort(liSorterTitleAsc);
};

exec();

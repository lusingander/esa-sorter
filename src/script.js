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

const exec = () => {
  const nav = document.querySelector("nav.navbar-side");
  if (nav === null) return;
  const ul = nav.querySelector("ul");
  if (ul === null) return;
  const lis = ul.querySelectorAll("li");

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
  let sortable = null;
  keySelectorElem.addEventListener("click", e => {
    const current = sortKeyTextElem.textContent;
    if (current === sortKeyTitleAsc) {
      sort(liSorterTitleDesc);
      sortKeyTextElem.textContent = sortKeyTitleDesc;
    } else if (current === sortKeyTitleDesc) {
      sort(liSorterCountAsc);
      sortKeyTextElem.textContent = sortKeyCountAsc;
    } else if (current === sortKeyCountAsc) {
      sort(liSorterCountDesc);
      sortKeyTextElem.textContent = sortKeyCountDesc;
    } else if (current === sortKeyCountDesc) {
      chrome.storage.local.get("custom-order", items => {
        if ("custom-order" in items) {
          const order = items["custom-order"];
          sort((a, b) => {
            const ai = order[a.title] || 99999; // FIX
            const bi = order[b.title] || 99999;
            if (ai < bi) return -1;
            if (ai > bi) return 1;
            return 0;
          });
        }
      });
      sortable = Sortable.create(ul, {
        group: "esa-categories",
        animation: 150,
        onUpdate: (evt) => {
          const data = [].slice
            .call(ul.querySelectorAll("li"))
            .map((li, i) => ({title: getTitleFromLi(li), index: i + 1})) // (0 || n) => n
            .reduce((map, obj) => {
              map[obj.title] = obj.index;
              return map;
            }, {})
          chrome.storage.local.set({"custom-order": data});
        }
      });
      sortKeyTextElem.textContent = sortKeyUserCustom;
    } else {
      sortable.destroy();
      sort(liSorterTitleAsc);
      sortKeyTextElem.textContent = sortKeyTitleAsc;
    }
  });
  keySelectorElem.appendChild(sortIconElem);
  keySelectorElem.appendChild(sortKeyTextElem);
  nav.insertBefore(keySelectorElem, ul);

  sort(liSorterTitleAsc);
};

exec();

const sortKeyTitleAsc = "タイトル 昇順";
const sortKeyTitleDesc = "タイトル 降順";
const sortKeyCountAsc = "記事数 昇順";
const sortKeyCountDesc = "記事数 降順";

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
        title: li.querySelector("span.title > span.navbar-side__title-name")
          .innerHTML,
        count: Number(li.querySelector("span.count-num").innerHTML)
      }))
      .sort(sorter)
      .forEach(li => {
        ul.appendChild(li.li);
      });
  };

  const keySelectorElem = document.createElement("div");
  keySelectorElem.setAttribute("id", "esa-sorter-key-selector");
  keySelectorElem.appendChild(document.createTextNode(sortKeyTitleAsc));
  keySelectorElem.addEventListener("click", e => {
    const current = keySelectorElem.textContent;
    if (current === sortKeyTitleAsc) {
      sort(liSorterTitleDesc);
      keySelectorElem.textContent = sortKeyTitleDesc;
    } else if (current === sortKeyTitleDesc) {
      sort(liSorterCountAsc);
      keySelectorElem.textContent = sortKeyCountAsc;
    } else if (current === sortKeyCountAsc) {
      sort(liSorterCountDesc);
      keySelectorElem.textContent = sortKeyCountDesc;
    } else {
      sort(liSorterTitleAsc);
      keySelectorElem.textContent = sortKeyTitleAsc;
    }
  });
  nav.insertBefore(keySelectorElem, ul);

  sort(liSorterTitleAsc);
};

exec();

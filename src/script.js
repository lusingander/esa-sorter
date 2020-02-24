const liSorterTitleAsc = (a, b) => {
  if (a.title < b.title) {
    return -1;
  } else if (a.title > b.title) {
    return 1;
  }
  return 0;
};

const liSorterTitleDesc = (a, b) => -1 * liSorterTitleAsc(a, b);

const nav = document.querySelector("nav.navbar-side");
const ul = nav.querySelector("ul");
const lis = ul.querySelectorAll("li");

const sort = sorter => {
  [].slice
    .call(lis)
    .map(li => ({
      li: li,
      title: li.querySelector("span.title > span.navbar-side__title-name")
        .innerHTML
    }))
    .sort(sorter)
    .forEach(li => {
      ul.appendChild(li.li);
    });
};

const keySelectorElem = document.createElement("div");
keySelectorElem.appendChild(document.createTextNode("Title Asc"));
keySelectorElem.addEventListener("click", e => {
  const current = keySelectorElem.textContent;
  if (current === "Title Asc") {
    sort(liSorterTitleDesc);
    keySelectorElem.textContent = "Title Desc";
  } else {
    sort(liSorterTitleAsc);
    keySelectorElem.textContent = "Title Asc";
  }
});
nav.insertBefore(keySelectorElem, ul);

sort(liSorterTitleAsc);

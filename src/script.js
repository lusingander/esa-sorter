const ul = document.querySelector("nav.navbar-side > ul");
const lis = ul.querySelectorAll("li");

const liSorter = (a, b) => {
  if (a.key < b.key) {
    return -1;
  } else if (a.key > b.key) {
    return 1;
  }
  return 0;
};

[].slice
  .call(lis)
  .map(li => ({
    li: li,
    key: li.querySelector("span.title > span.navbar-side__title-name").innerHTML
  }))
  .sort(liSorter)
  .forEach(li => {
    ul.appendChild(li.li);
  });

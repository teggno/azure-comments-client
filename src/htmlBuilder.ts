export default function<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  createCallback?: (element: HTMLElementTagNameMap[K]) => void
) {
  var childBuilders: (ElementBuilder | ChildBuilder)[] = [];
  var buildFunctions: {
    [name: string]: (element: HTMLElementTagNameMap[K]) => void;
  } = {};
  var builder = {
    innerHTML: (innerHTML: string) => {
      buildFunctions["innerHTML"] = element => {
        element.innerHTML = innerHTML;
      };
      return builder;
    },
    attribute: (name: string, value: string) => {
      buildFunctions["attribute"] = element => {
        element.setAttribute(name, value);
      };
      return builder;
    },
    withChildren: (children: (ElementBuilder | ChildBuilder)[]) => {
      children.forEach(c => {
        if (childBuilders.indexOf(c) === -1) childBuilders.push(c);
      });
      return builder;
    },
    addEventListener: (event: string, listener: (e: Event) => void) => {
      buildFunctions["addEventListener"] = element => {
        element.addEventListener(event, listener);
      };
      return builder;
    },
    build: () => {
      var element = document.createElement(tagName);
      for (var name in buildFunctions) {
        buildFunctions[name](element);
      }
      childBuilders.forEach(c =>
        element.appendChild(
          (<ElementBuilder>c).build
            ? (<ElementBuilder>c).build()
            : (<ChildBuilder>c)()
        )
      );
      if (createCallback) createCallback(element);
      return element;
    }
  };
  return builder;
}

interface ElementBuilder {
  build(): HTMLElement;
}

interface ChildBuilder {
  (): Text | HTMLElement;
}

/** Creates a builder for an element of the type indicated by tagName. */
export default function<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  createCallback?: (element: HTMLElementTagNameMap[K]) => void
) {
  var childBuilders: (ElementBuilder | ChildBuilder)[] = [];
  var buildFunctions: {
    [name: string]: (element: HTMLElementTagNameMap[K]) => void;
  } = {};
  var builder = {
    /**
     * Only call once. Otherwise last call (before call to build()) wins.
     */
    innerHTML: (innerHTML: string) => {
      buildFunctions["innerHTML"] = element => {
        element.innerHTML = innerHTML;
      };
      return builder;
    },
    /**
     * Can be called multiple times.
     */
    attribute: (name: string, value: string) => {
      var existingFunction = buildFunctions["attribute"];
      buildFunctions["attribute"] = element => {
        if (existingFunction) existingFunction(element);
        element.setAttribute(name, value);
      };
      return builder;
    },
    /**
     * Can be called multiple times.
     */
    withChildren: (children: (ElementBuilder | ChildBuilder)[]) => {
      children.forEach(c => {
        if (childBuilders.indexOf(c) === -1) childBuilders.push(c);
      });
      return builder;
    },
    /**
     * Can be called multiple times.
     */
    addEventListener: (event: string, listener: (e: Event) => void) => {
      var existingFunction = buildFunctions["addEventListener"];
      buildFunctions["addEventListener"] = element => {
        if (existingFunction) existingFunction(element);
        element.addEventListener(event, listener);
      };
      return builder;
    },
    /**
     * Can be called multiple times.
     */
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

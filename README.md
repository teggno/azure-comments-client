## Web client for the azure-comments blog comment system

### Initialization on page
There might be an initialization function that must be executed on a page first thing which has the following parameters:
* Recaptcha Site key
* Azure Function App URL (or even URL for each endpoint)

### More ideas for options
* Use captcha or not
* Pluggable captcha function
* Log in (optional/mandatory)
* More fields
* Configurable fields
* Provide own template for UI
* Provide css class names for individual parts of the UI
* Configurable theme


### Using it on the blog pages
To place the **show comments button** at a post you could
* call js function `singlePostCommentUI(urlOfThePostCommentsShouldBeDisplayedFor, domElementToContainTheUI)`. If you have multiple posts on the same page, call the function repeatedly.
* call js function `singlePostCommentUI(urlOfThePostCommentsShouldBeDisplayedFor)`. Will return DOM element you can place anywhere you like.

### Other Ideas
* Create CLI to bootstrap everything
* Provide all scripts necessary so it sets itself up automatically
* Provide the whole thing as a cheap service (i.e. support tenants (maybe just have an azure resource group for each tenant)). If do this, blog about it.
* Add a react version.
* When a comment author has provided an email address, he might want to get notified about replies to his comment. (must prevent spamming though)

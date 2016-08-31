# cubbles-coder-devtools

The **"Coder DeveloperTools"** (alias "DevTools") are a collection of grunt -tasks to simplify development and deployment of cubbles-webpackages.
If you have created your cubx-project using the yeoman generator ( *$ yo cubbles* ), you already have a DevTools -version in place. You can use it as-is to develop your webpackage(s).

## How to map the latest DeveloperTools into your project
If you want to *map-in* the latest DevTools (with bugfixes, improvements and/or new features), read here ...

We use the *"git subtree"* -feature to add and (if needed) to update the DeveloperTools. The basic principle is, that a 'copy' of this project will be part (a subtree) of your project-file-tree.
You find an overview on how to deal with git-subtrees at <http://blogs.atlassian.com/2013/05/alternatives-to-git-submodule-git-subtree/>.

### Map the DevTools using the 'git-subtree' package
This guide makes use of the npm-package <https://www.npmjs.com/package/git-subtree>. In combination with a grunt -task within in your *original* DevTools, it simplifies the whole thing a bit:

1. Init the config using the included grunt-task:

        $ cd devtools
        $ grunt prepare-cubx.devtools-asGitSubtree

2. Map the DevTools into a separate folder "devtools-mappedIn":

        # change into your projects root-directory
        $ cd ..
        $ git-subtree init

3. Install the dependencies and you are ready to rock:

        # change into your new devtools-folder
        $ cd devtools-mappedIn

        # install the deps
        $ npm install

        # now run your first command
        $ grunt

**And then, each time you want to merge in the latest changes of the DevTools:**

        # change into your projects root-directory
        $ cd ..

        # fetch and merge the latest changes
        $ git-subtree pull devtools


Notes:

1. The the config used for all the *git-subtree* commands is editable in *subtrees.json* within your projects root-directory.
2. If you clone a project with an already included subtree - do also execute all these steps, if you want to be able to pull DevTools -changes too.



### Map the DevTools using git-commands only
You can do the same using native git-commands only - by doing the following steps:

1. Add this repo as a remote-repository to your project´s git config:

        $ git remote add -f cubbles-coder-devtools https://github.com/cubbles/cubbles-coder-devtools.git

2.  Add the subtree:

        # fetch the current state of the branch of your choice (here 'master')
        $ git fetch cubbles-coder-devtools master

        # create a folder 'devtools' and add all resources of the 'cubbles-coder-devtools' -remote´s 'master' -branch
        $ git subtree add --prefix devtools cubbles-coder-devtools/master --squash

3.  Later ... Update the subtree in case you´d like to merge in changes:

        # fetch the current state
        $ git fetch cubbles-coder-devtools master

        # merge in the locally available updates
        $ git subtree merge --prefix devtools cubbles-coder-devtools/master --squash

3.  For IDE-Committers ... Pushing modifications from your subtree back to the upstream-repo is easy:

        # fetch the current state
        $ git subtree push --prefix devtools cubbles-coder-devtools master

Note: For different _modelVersions_ of a WebPackage surely we need to provide related devtools-Versions. Maybe we manage this with different branches. So be sure to refer to the right branch when using the commands above.


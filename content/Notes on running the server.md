```
npx quartz sync --no-pull
```

> `fatal: --[no-]autostash option is only valid with --rebase`
> 
> You may have an outdated version of `git`. Updating `git` should fix this issue.

In future updates, you can simply run `npx quartz sync` every time you want to push updates to your repository.

For full help options, you can run `npx quartz sync --help`.

Most of these have sensible defaults but you can override them if you have a custom setup:

- `-d` or `--directory`: the content folder. This is normally just `content`
- `-v` or `--verbose`: print out extra logging information
- `--commit` or `--no-commit`: whether to make a `git` commit for your changes
- `--push` or `--no-push`: whether to push updates to your GitHub fork of Quartz
- `--pull` or `--no-pull`: whether to try and pull in any updates from your GitHub fork (i.e. from other devices) before pushing
- [ ] 

> https://www.imarc.com/blog/case-study-in-readable-typography
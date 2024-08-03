# -*- coding: utf-8 -*-
from datetime import datetime
import json
import sys
from pathlib import Path
from typing import Any
import html
from urllib.parse import unquote
import regex

try:
    from . import md_import_helpers as helpers
except ImportError:
    import md_import_helpers as helpers

with open("/tmp/all_posts_md.json", "r") as f:
    data = json.load(f)

results = data["data"]["posts"]["results"]


def strip_referral_url(url: str) -> str:
    prefix = "https://www.lesswrong.com/out?url="
    if not url.startswith(prefix):
        return ""
    target_url = url.partition(prefix)[2]
    target_url = unquote(target_url)  # eg %3A to :
    return target_url


pairs = (
    ("permalink", "slug"),
    ("lw-was-draft-post", "draft"),
    ("lw-is-af", "af"),
    ("lw-is-debate", "debate"),
    ("lw-page-url", "pageUrl"),
    ("lw-linkpost-url", "linkUrl"),
    ("lw-is-question", "question"),
    ("lw-posted-at", "postedAt"),
    ("lw-last-modification", "modifiedAt"),
    ("lw-curation-date", "curatedDate"),
    ("lw-frontpage-date", "frontpageDate"),
    ("lw-was-unlisted", "unlisted"),
    ("lw-is-shortform", "shortform"),
    ("lw-num-comments-on-upload", "commentCount"),
    ("lw-base-score", "baseScore"),
    ("lw-vote-count", "voteCount"),
    ("af-base-score", "afBaseScore"),
    ("af-num-comments-on-upload", "afCommentCount"),
)


def get_lw_metadata(post_info: dict[str, Any]) -> dict:
    metadata = dict((key, post_info[val]) for (key, val) in pairs)
    metadata["permalink"] = helpers.permalink_conversion[post_info["slug"]]

    metadata["publish"] = (
        "true" if not metadata["lw-was-draft-post"] else "false"
    )

    title = post_info["title"].replace('"', "'")
    metadata["title"] = f'"{title}"'  # Escape in case of colons
    if "contents" in post_info and (post_info["contents"]):
        metadata["lw-latest-edit"] = post_info["contents"]["editedAt"]
        metadata["lw-is-linkpost"] = not (
            metadata["lw-page-url"] == metadata["lw-linkpost-url"]
        )
        if metadata["lw-is-linkpost"]:
            metadata["lw-linkpost-url"] = strip_referral_url(
                metadata["lw-linkpost-url"]
            )

    if "coauthors" in post_info and post_info["coauthors"]:
        authors = ["Alex Turner"]
        for coauthor in post_info["coauthors"]:
            display_name = coauthor["displayName"]
            if display_name in helpers.username_dict:
                display_name = helpers.username_dict[display_name]
            authors.append(display_name)
        if len(authors) > 2:
            author_str = ", ".join(authors[:-1]) + f", and {authors[-1]}"
        elif len(authors) == 2:
            author_str = f"{authors[0]} and {authors[1]}"
        else:
            author_str = authors[0]
        metadata["authors"] = author_str

    metadata["tags"] = [entry["name"] for entry in post_info["tags"]]
    metadata["tags"] = set(
        filter(lambda x: x in helpers.keep_tags, metadata["tags"])
    )
    metadata["tags"] = list(
        map(
            lambda tag: (
                helpers.tag_rename_dict[tag]
                if tag in helpers.tag_rename_dict
                else tag
            ),
            metadata["tags"],
        )
    )
    metadata["tags"] = [tag.replace(" ", "-") for tag in metadata["tags"]]

    if not metadata["tags"]:
        print(f"ALERT: {metadata['title']} has no tags\n")

    metadata["aliases"] = [post_info["slug"]]
    if "podcastEpisode" in post_info and (
        episode := post_info["podcastEpisode"]
    ):
        metadata["lw-podcast-link"] = episode["episodeLink"]
    if "sequence" in post_info and (sequence := post_info["sequence"]):
        metadata["lw-sequence-title"] = sequence["title"]
        metadata["lw-sequence-image-grid"] = sequence["gridImageId"]
        metadata["lw-sequence-image-banner"] = sequence["bannerImageId"]

    for order in ("prev", "next"):
        if post_info[f"{order}Post"]:
            metadata[f"{order}-post-slug"] = post_info[f"{order}Post"]["slug"]

    if "reviewWinner" in post_info and (
        review_info := post_info["reviewWinner"]
    ):
        metadata["lw-review-art"] = review_info["reviewWinnerArt"]
        metadata["lw-review-competitor-count"] = review_info["competitorCount"]
        metadata["lw-review-year"] = review_info["reviewYear"]
        metadata["lw-review-ranking"] = review_info["reviewRanking"]
        metadata["lw-review-category"] = review_info["category"]
    return metadata


def add_quartz_metadata(meta: dict[str, Any]) -> dict[str, Any]:
    publication_timestamp: str = meta["lw-posted-at"]
    # Parse the timestamp (Z indicates UTC timezone)
    dt = datetime.fromisoformat(
        publication_timestamp[:-1]
    )  # Remove the trailing 'Z'

    # Format into desired string
    formatted_date = dt.strftime("%m/%d/%Y")
    meta["date_published"] = formatted_date

    meta["original_url"] = meta["lw-page-url"]
    return meta


def _entry_to_yaml(key: str, val: Any) -> str:
    yaml = f"{key}: "
    if isinstance(val, list):
        yaml += "\n"
        for item in val:
            yaml += f'  - "{item}"\n'
        return yaml
    elif isinstance(val, bool):
        val = f'"{str(val).lower()}"'
    yaml += f"{val}\n"
    return yaml


def metadata_to_yaml(meta: dict[str, Any]) -> str:
    yaml = "---\n"
    for key, val in meta.items():
        yaml += _entry_to_yaml(key, val)
    yaml += "---\n"
    return yaml


def fix_footnotes(text: str) -> str:
    # Footnote invocation replacement (from LW format)
    text = regex.sub(r"\[\\\[([^\]]*)\\\]\]\(.*?\)", r"[^\1]", text)
    # Footnote content replacement (from LW format)
    text = regex.sub(r"(\d+)\.\s*\*{2}\[\^\]\(.*?\)\*{2}\s*", r"[^\1]: ", text)

    # Ensure separation after hyperlinks
    return regex.sub(r"\)(\w)", r") \1", text)


def parse_latex(markdown: str) -> str:
    # Turn into block mode if it should be display math
    markdown = regex.sub(
        r"(?:[^\$]|^)\$\\begin\{(align|equation)\}",
        r"$$\\begin{\1}",
        markdown,
        flags=regex.MULTILINE,
    )
    markdown = regex.sub(
        r"\\end\{(align|equation)\} *\$(?!\$)",
        r"\\end{\1}$$",
        markdown,
        flags=regex.MULTILINE,
    )

    # Add newline after the beginning of display math
    markdown = regex.sub(
        r"(?<=\$\$)(?=[^\n])", r"\n", markdown, flags=regex.MULTILINE
    )
    # Add newline before the end of display math
    markdown = regex.sub(
        r"(?<=[^\n])(?=\$\$)", r"\n", markdown, flags=regex.MULTILINE
    )

    # # Have proper newlines for equations
    markdown = regex.sub(
        r"([^\\])\\(?=$)", r"\1\\\\", markdown, flags=regex.MULTILINE
    )

    return markdown


# Get all hashes
for post in results:
    if not post["contents"]:
        continue
    current_hash = post["pageUrl"].split("/")[-2]
    helpers.hash_to_slugs[current_hash] = helpers.permalink_conversion[
        post["slug"]
    ]


md_url_pattern = regex.compile(r"\[([^][]+)\](\(((?:[^()]+|(?2))+\)))")


def _get_urls(markdown: str) -> list[str]:
    urls = []
    for re_match in md_url_pattern.finditer(markdown):
        _, _, url = re_match.groups()
        urls.append(url)

    return urls


# Turn links to my LW posts into internal links
def remove_prefix_before_slug(url: str) -> str:
    for website_hash, slug in helpers.hash_to_slugs.items():
        lw_regex = regex.compile(
            rf"(?:lesswrong|alignmentforum).*?{website_hash}(\#(.*?))?"
        )

        # Capture anchor information after the slug (if present)
        re_match = regex.search(lw_regex, url)
        if re_match:
            anchor = (
                re_match.group(2) or ""
            )  # Extract the anchor part (e.g., "#section-title")
            url = f"/{slug}#{anchor})" if anchor else f"/{slug})"
            return url

    return url  # Return the original URL if no slug match


def replace_urls(markdown: str) -> str:
    urls: list[str] = _get_urls(markdown)
    for url in urls:
        if "commentId=" in url:
            continue  # Skip comments
        sanitized_url: str = remove_prefix_before_slug(url)
        markdown = markdown.replace(url, sanitized_url)
    return markdown


# regex_not_in_code = r"\`{1,3}.*?\`{1,3}(*SKIP)(*FAIL)|"
# reg_unescaped_camel = regex_not_in_code + r"\b((?:_)?\w+(?:_\w+)+)"
# def replace_camel_case(md: str) -> str: # TODO not working properly
#   return regex.sub(reg_unescaped_camel, r"\`\\1\`", md)


# Fixing some broken urls and other apparent casualties of markdown conversion
replacement = {
    "Hoffmann,Ruettler,Nieder(2011) AnimBehav.pdf": "Hoffmann,Ruettler,Nieder(2011)AnimBehav.pdf",
    "is_in": "is _in",
    "<em>openai.com/o</em>penai-five/": "openai.com/openai-five/",
    r"\(<em>h</em>ttps://": "(https://",
    "茂": "ï",
    "": "",  # TODO reinsert this thing showing up before double 'f'. was problem in original IC post
    "◻️": "∎",  # Official end of proof symbol
    "lesserwrong.com": "lesswrong.com",
    # Latex substitutions
    r"\\DeclareMathOperator\*?{\\argmax}{arg\\,max}": "",
    r"\\DeclareMathOperator\*?{\\min}{min\\,min}": "",
    # Dead links need redirect
    "https://i.stack.imgur.com": "https://i.sstatic.net",
    "✔️": "✓",  # too hard to see emoji in dark mode
    r"\biff\b": "IFF",
    r"_\._": r"\.",  # Delete this annoying failure to italicize
    "\xa0": " ",  # NBSP to normal space
    r"\* \* \*": "<hr/>",  # Fix horizontal rules
    r"\<\|endoftext\|\>": "<endoftext>",
    '" wedding"': "“ wedding”",  # Smart quotes have trouble with this one
    '" "': "“ ”",  # For wedding vector minus space
    "Position 0": "Pos. 0",  # For GPT2 post
    r"\*\*Prompt given to the model\*\*": "Prompt given to the model",
    "2019/2020": "2019 & 2020",
    "_ [_Anki_](https://apps.ankiweb.net/) _.": "[Anki](https://apps.ankiweb.net/).",
}


def manual_replace(md: str) -> str:
    for key, val in replacement.items():
        md = regex.sub(key, val, md)
    return md


def move_citation_to_quote_admonition(md: str) -> str:
    # Move link attribution to beginning
    start_adm_pattern = r"> \[!quote\]\s*"
    body_pattern = r"(?P<body>(?:>.*\n)+?)"  # Main part of the quote
    line_break_pattern = r"(?:>\s*)*"

    # TODO check that prelink works
    pre_citation_pattern = r"> *[~\-—–]+[ _\*]*(?P<prelink>[^\]]*)"
    link_text_pattern = r"(?P<linktext>[^_\*\]]+)"
    url_pattern = r"\((?P<url>[^#].*?)\)"
    link_pattern = r"\[[_\*]*" + link_text_pattern + r"[_\*]*\]"
    post_citation_pattern = r"[ _\*]*"
    pattern = (
        start_adm_pattern
        + body_pattern
        + line_break_pattern
        + pre_citation_pattern
        + link_pattern
        + url_pattern
        + post_citation_pattern
    )

    target = r"> [!quote] \g<prelink>[\g<linktext>](\g<url>)\n\g<body>"
    md = regex.sub(pattern, target, md)

    # TODO incorporate "> [Non-adversarial principle, Arbital](link)" as well
    # move normal attribution to beginning
    pattern = (
        start_adm_pattern
        + body_pattern
        + line_break_pattern
        + pre_citation_pattern
        + r"(?P<citationtext>[\w\,\-_\. ]+)"
        + post_citation_pattern
    )
    target = r"> [!quote] \g<citationtext>\n\g<body>"
    md = regex.sub(pattern, target, md)

    # Strip a trailing newline if needed
    md = md.rstrip("\n")
    return md


def remove_warning(markdown: str) -> str:
    return markdown.split(
        "moved away from optimal policies and treated reward functions more realistically.**\n"
    )[-1]


def process_markdown(post_info: dict[str, Any]) -> str:
    md = post_info["contents"]["markdown"]
    md = manual_replace(md)

    # Not enough newlines before A: in inner/outer
    md = regex.sub(r"\n(?=\*\*A:\*\*)", r"\n\n", md)
    md = remove_warning(md)  # Warning on power-seeking posts
    md = html.unescape(md)

    md = fix_footnotes(md)

    # unescape the new lines
    newlined = md.replace("\\\\", "\\").replace(r"\\([\[\]\(\)-])", "\\1")
    # fix the lists to not have extra newlines
    single_line_li_md = regex.sub(r"\n\n(\s*)(\d\.|\*) ", r"\n\1\2 ", newlined)
    # make the block quotes contiguous
    contig_md = regex.sub(r"(\>.*?)\n\n(?=\>)", r"\1\n>\n", newlined)

    # surround multiline block quotes with a quote admonition
    longquote_regex = r"((?:^>\s*.*(?:\r?\n|\r)){3,})"
    md = regex.sub(
        longquote_regex, r"> [!quote]\n>\n\1", contig_md, flags=regex.MULTILINE
    )
    md = move_citation_to_quote_admonition(md)

    # Make links to posts relative, now target turntrout.com
    md = replace_urls(md)

    # Standardize "eg" and "ie"
    md = regex.sub(
        r"\b(?!e\.g\.)e\.?g\.?,?\b", "e.g.", md, flags=regex.IGNORECASE
    )
    md = regex.sub(
        r"\b(?!i\.e\.)i\.?e\.?,?\b", "i.e.", md, flags=regex.IGNORECASE
    )

    # Simplify eg 5*5 and \(5\times5\) to 5x5
    number_regex = r"[\-−]?(?:\d{1,3}(?:\,?\d{3})*(?:\.\d+)?|(?:\.\d+))"
    times_sign_regex = r"\s*?(?:\*|\\times)\s*?"
    times_regex_nums = rf"(?:\\\()?({number_regex}|n){times_sign_regex}({number_regex}|n)(?:\\\))?"
    coeff_regex = rf"(coeff){times_sign_regex}(\w+)"
    md = regex.sub(rf"{times_regex_nums}|{coeff_regex}", r"\1×\2", md)

    # Delete extra spaces around bullets
    bulleted_line = r" *\*(?!\*).*\n"
    md = regex.sub(
        rf"({bulleted_line}) *\n({bulleted_line})(?: *\n)?", r"\1\2", md
    )
    # Get rid of lines before list start \n\n**A-Outer:**
    md = regex.sub(r"\n *\n( *\*(?: .*)?\n)", r"\n\1", md)

    # Get rid of extraneous e.g. erroneously spaced emphasis "_test _"
    # TODO reconsider?
    # md = regex.sub(r"_(.*) _", r"_\1_", md)

    # TODO make [!notes] admonitions
    # TODO footnote conversion
    # TODO color conversion -- actually do in JS/CSS
    # single-line $ $ to $$ $$
    md = regex.sub(
        r"^ *\$([^\$].*[^\$])\$ *$", r"$$\1$$", md, flags=regex.MULTILINE
    )

    md = parse_latex(md)

    return md


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise ValueError("Error: Incorrect number of arguments")

    title_substring = sys.argv[1]

    with open("/tmp/all_posts_md.json", "r") as f:
        data = json.load(f)

    results = data["data"]["posts"]["results"]

    matching_posts = [
        post for post in results if title_substring in post["title"]
    ]

    if len(matching_posts) == 0:
        raise FileNotFoundError(
            f"Error: No posts found with title containing '{title_substring}'"
        )
    elif len(matching_posts) > 1:
        print(
            f"Error: Multiple posts found with title containing '{title_substring}':"
        )
        for post in matching_posts:
            print(f"- {post['title']}")
        sys.exit(1)

    post = matching_posts[0]

    if not post["contents"]:
        raise ValueError("Error: Post has no contents")

    metadata = get_lw_metadata(post)
    metadata = add_quartz_metadata(metadata)
    yaml = metadata_to_yaml(metadata)
    post_md = process_markdown(post)
    md = yaml + post_md

    output_filename = f"{post['slug']}.md"
    with open(
        Path("..", "content", "drafts", output_filename), "w", encoding="utf-8"
    ) as f:
        f.write(md)

    print(f"Processed post: {post['title']}")
    print(f"Output written to: {output_filename}")
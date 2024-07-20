#!/usr/bin/env python3
import argparse
import compress
import subprocess
from pathlib import Path, PurePath
import re
import git

# pyright: reportPrivateImportUsage = false


def get_git_root() -> Path | None:
    """Returns the absolute path to the top-level directory of the Git repository."""
    completed_process = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True
    )
    return (
        Path(completed_process.stdout.strip())
        if completed_process.returncode == 0
        else None
    )


R2_BASE_URL: PurePath = PurePath("https://assets.turntrout.com")
R2_BUCKET_NAME: str = "turntrout"
GIT_ROOT = get_git_root()
CONTENT_FILES = list((GIT_ROOT / "content").rglob("*.md")) if GIT_ROOT else []


def _video_patterns(input_file: Path) -> tuple[str, str]:
    """Returns the original and replacement patterns for video files."""
    # Function to create unique named capture groups for different link patterns
    link_pattern_fn = lambda tag: rf"(?P<link_{tag}>[^\)]*)"

    # Pattern for markdown image syntax: ![](link)
    parens_pattern: str = (
        rf"\!?\[\]\({link_pattern_fn('parens')}{input_file.stem}\.{input_file.suffix}\)"
    )

    # Pattern for wiki-link syntax: [[link]]
    brackets_pattern: str = (
        rf"\!?\[\[{link_pattern_fn('brackets')}{input_file.stem}\.{input_file.suffix}\]\]"
    )

    # Link pattern for HTML tags
    tag_link_pattern: str = link_pattern_fn("tag")

    if input_file.suffix == ".gif":
        # Pattern for <img> tags (used for GIFs)
        tag_pattern: str = (
            rf'<img (?P<earlyTagInfo>[^>]*)src="{tag_link_pattern}{input_file.stem}\.gif"(?P<tagInfo>[^>]*)\/?>'
        )
    else:
        # Pattern for <video> tags (used for other video formats)
        tag_pattern: str = (
            rf'<video (?P<earlyTagInfo>[^>]*)src="{tag_link_pattern}{input_file.stem}\.{input_file.suffix}"(?P<tagInfo>.*)(?:type="video/{input_file.suffix}")?(?P<endVideoTagInfo>[^>]*(?=/))\/?>'
        )

    # Combine all patterns into one, separated by '|' (OR)
    original_pattern: str = (
        rf"{parens_pattern}|{brackets_pattern}|{tag_pattern}"
    )

    # Combine all possible link capture groups
    all_links = r"\g<link_parens>\g<link_brackets>\g<link_tag>"

    # Convert to .webm video
    if input_file.suffix == ".gif":
        replacement_pattern: str = (
            rf'<video autoplay loop muted playsinline src="{all_links}{input_file.stem}.webm"\g<earlyTagInfo>\g<tagInfo> type="video/webm"><source src="{all_links}{input_file.stem}.webm"></video>'
        )
    else:
        replacement_pattern: str = (
            rf'<video src="{all_links}{input_file.stem}.webm"\g<earlyTagInfo> type="video/webm"\g<tagInfo>\g<endVideoTagInfo>/>'
        )

    return original_pattern, replacement_pattern


# Function to handle conversion and optimization of a single file
def convert_asset(
    input_file: Path,
    remove_originals: bool = False,
    strip_metadata: bool = False,
) -> None:
    """Converts an image or video to a more efficient format. Replaces
    references in markdown files.

    Args:
        input_file: The path to the file to convert.
        remove_originals: Whether to remove the original file.
        strip_metadata: Whether to strip metadata from the converted file.
    """
    if not input_file.is_file():
        raise FileNotFoundError(f"Error: File '{input_file}' not found.")

    if not "quartz/static" in str(input_file):
        raise ValueError("The path must address quartz/static.")

    if input_file.suffix in compress.ALLOWED_IMAGE_EXTENSIONS:
        output_file = input_file.with_suffix(".avif")
        compress.image(input_file)

        original_pattern = str(input_file)
        replacement_pattern = str(output_file)
        print(original_pattern)
        print(replacement_pattern)

    elif input_file.suffix in compress.ALLOWED_VIDEO_EXTENSIONS:
        output_file = input_file.with_suffix(".webm")
        compress.video(input_file)

        original_pattern, replacement_pattern = _video_patterns(input_file)

    else:
        raise ValueError(
            f"Error: Unsupported file type '{input_file.suffix}'."
        )

    for md_file in CONTENT_FILES:
        with open(md_file, "r") as file:
            content = file.read()
        content = re.sub(original_pattern, replacement_pattern, content)
        with open(md_file, "w") as file:
            file.write(content)

    # Strip Metadata
    if strip_metadata:
        subprocess.run(
            ["exiftool", "-all=", str(output_file)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    # Remove Original
    if remove_originals:
        input_file.unlink()  # Safely remove the original file


if __name__ == "__main__":
    if not GIT_ROOT:
        raise RuntimeError("Error: Not in a Git repository.")

    # Argument Parsing
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-r",
        "--remove_originals",
        action="store_true",
        help="Remove original files after conversion",
    )
    parser.add_argument(
        "-s",
        "--strip_metadata",
        action="store_true",
        help="Strip metadata from converted files",
    )
    args = parser.parse_args()

    repo = git.Repo(GIT_ROOT)
    for file in (GIT_ROOT / "content").glob("**.md"):
        if not file in repo.ignored(file):
            convert_asset(file, args.remove_originals, args.strip_metadata)
"""Setup configuration for Playlist Farm"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="playlist-farm",
    version="1.0.0",
    author="Joseph Volmer",
    description="Systematically collect Spotify playlist curator contact information",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/josephvolmer/playlist-farm",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Multimedia :: Sound/Audio",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.31.0",
        "openpyxl>=3.1.2",
        "textual>=1.0.0",
        "rich>=13.9.4",
    ],
    entry_points={
        "console_scripts": [
            "playlist-farm=playlist_farm.cli.main:main",
            "playlist-farm-tui=playlist_farm.tui.app:main",
            "playlist-farm-analyze=playlist_farm.cli.analyze:main",
            "playlist-farm-setup=playlist_farm.cli.setup:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)

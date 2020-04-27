# D3 Brushing and Linking Lecture and Demo

During the Fall 2019 semester, I was a graduate teaching assistant for Georgia Tech's [Information Visualization](http://va.gatech.edu/courses/cs4460/) course, which focuses on information visualization design principles as well as practical experience developing visualizations for small-to-medium-scale datasets using the JavaScript data visualization library [d3.js](https://d3js.org/).

Over the course of the semester, my four fellow teaching assistants and I each got to take charge of at least one lecture in order to gain hands-on teaching experience as well as help out the course's [professor](http://va.gatech.edu/endert/) when he needed to travel. For my lecture, I designed a programming tutorial on the "brushing and linking" visualization technique using D3.js. This technique applies to visualizations with multiple views of the same dataset, and involves interactively selecting a subset of data cases in one view in order to highlight the same data cases in the other views.

For my demo, I put together a small dataset concerning the Nintendo Gamecube games that I own, something personally meaningful to me as an avid video game collector. To visualize the dataset, I created a D3 program consisting of three side-by-side scatterplots showing the resale prices of the games in October 2019 plotted against three other variables: the same resale prices in October 2018, the games' ratings on a scale from 0 to 5, and the number of units sold in North America for each game. During my lecture, I gave a live demonstration of how to implement brushing and linking on the three charts to compare subsets of the game data across all three charts, and an additional demonstration of the [d3-tip](https://github.com/caged/d3-tip) library for interactive tooltips in D3.

This repository contains my demo code, dataset, and lecture slides that I presented in class.

![Example image of the program running](https://github.com/joeygonzalesdones/d3-brushing-and-linking-lecture/blob/master/example-screenshot.png)

## Running the Program

To run the program, either directly open the `/code/index.html` file with the web browser of your choice (may not work with all browsers), or run a local HTTP server (e.g., with Python 3 installed, navigate to the `/code` directory with the command line and run `py -m http.server 8080`), which will make the program viewable by navigating to `localhost:8080` in the browser.

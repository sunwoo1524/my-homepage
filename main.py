from flask import Flask, render_template


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/gameoflife")
def gameOfLife():
    return render_template("life.html")


@app.route("/tetris")
def tetris():
    return render_template("tetris.html")


if __name__ == "__main__":
    app.run(debug=True)

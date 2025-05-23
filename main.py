from agno import playground
from teams import HackerNews

app = playground.Playground(
    teams=[
        HackerNews,
    ],
).get_app()

if __name__ == "__main__":
    playground.serve_playground_app("main:app", reload=True)

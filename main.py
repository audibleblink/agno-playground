from agno import playground
from teams import HackerNewsTeam, ResearchTeam

app = playground.Playground(
    teams=[
        HackerNewsTeam,
        ResearchTeam,
    ],
).get_app(use_async=False)

if __name__ == "__main__":
    playground.serve_playground_app("main:app", reload=True)

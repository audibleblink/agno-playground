from agno import playground
from teams import HackerNewsTeam, ResearchTeam
from api.openai_router import router as openai_router

app = playground.Playground(
    teams=[
        HackerNewsTeam,
        ResearchTeam,
    ],
).get_app(use_async=False)

app.include_router(openai_router)

if __name__ == "__main__":
    playground.serve_playground_app("main:app", reload=True)

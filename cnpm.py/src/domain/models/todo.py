class Todo:
    id: int
    title: str
    description: str
    status: str

    def __init__(self, id, title, description, status, created_at, updated_at):
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

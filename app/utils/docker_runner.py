import docker

def run_poc_in_sandbox(poc_code: str):
    client = docker.from_env()
    try:
        container = client.containers.run(
            image="python:3.9-slim",
            command=["python", "-c", poc_code],
            detach=False,
            remove=True,
            network_disabled=True,
            security_opt=["no-new-privileges"],
            mem_limit="128m",
            pids_limit=100,
            stderr=True,
            stdout=True,
        )
        return container.decode()
    except docker.errors.ContainerError as e:
        return e.stderr.decode()
    except Exception as e:
        return str(e)
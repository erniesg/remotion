PROJECT = techinasia-peacock/remotion
NAME = 314303761830.dkr.ecr.ap-southeast-1.amazonaws.com/$(PROJECT)
ARCH ?= amd64
GIT_BRANCH ?= dev
GIT_COMMIT ?= latest
VERSION = $(GIT_BRANCH)-$(GIT_COMMIT)

.PHONY: build buildx buildx-push buildx-latest-push create-manifest release-manifest tag-latest push push-latest release release-buildx

build:
	git --no-pager show --stat
	docker build --network=host --build-arg VERSION=$(ARCH)-$(VERSION) --build-arg IMAGE=$$FROM_IMAGE -f ./Dockerfile -t $(NAME):$(ARCH)-$(VERSION) --platform=linux/$(ARCH) --rm  .

buildx:
	git --no-pager show --stat
	docker buildx create --use
	docker buildx build --platform linux/amd64,linux/arm64 -t $(NAME):$(VERSION) -f ./Dockerfile --rm .

buildx-push:
	git --no-pager show --stat
	docker buildx create --use
	docker buildx build --platform linux/amd64,linux/arm64 -t $(NAME):$(VERSION) -f ./Dockerfile --rm --push .

buildx-latest-push:
	git --no-pager show --stat
	docker buildx create --use
	docker buildx build --platform linux/amd64,linux/arm64 -t $(NAME):$(GIT_BRANCH)-latest -f ./Dockerfile --rm --push .

create-manifest:
	docker pull $(NAME):amd64-$(VERSION)
	docker pull $(NAME):arm64-$(VERSION)
	docker manifest rm $(NAME):$(VERSION) || true
	docker manifest create $(NAME):$(VERSION) \
	  --amend $(NAME):amd64-$(VERSION) \
	  --amend $(NAME):arm64-$(VERSION)

release-manifest:
	docker pull $(NAME):amd64-$(VERSION)
	docker pull $(NAME):arm64-$(VERSION)
	docker manifest rm $(NAME):$(VERSION) || true
	docker manifest create $(NAME):$(VERSION) \
	  --amend $(NAME):amd64-$(VERSION) \
	  --amend $(NAME):arm64-$(VERSION)
	docker manifest push $(NAME):$(VERSION)

tag-latest:
	docker tag $(NAME):$(ARCH)-$(VERSION) $(NAME):$(ARCH)-$(GIT_BRANCH)-latest

push:
	docker push $(NAME):$(ARCH)-$(VERSION)

push-latest:
	docker push $(NAME):$(ARCH)-$(GIT_BRANCH)-latest

release: build push

release-buildx: buildx-push

release-buildx-latest: buildx-latest-push

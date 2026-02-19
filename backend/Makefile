.PHONY: config db run setup stop

config:
	npm install

db:
	docker compose up -d

run:
	npm run dev

setup: 
	make config 
	make db 
	make run

stop:
	docker compose down
if proxying through burp, 
```
export SSL_CERT_FILE=$(python -m certifi)

# edit the cert chain
vim $SSL_CERT_FILE
```

run with `uv run playground.py`



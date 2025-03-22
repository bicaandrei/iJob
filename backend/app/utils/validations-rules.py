emailRegex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

def validateEmail(email):
    if re.match(emailRegex, email):
        return True
    else:
        return False
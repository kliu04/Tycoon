import os

trans = {
    "S" : "Spades",
    "H" : "Hearts",
    "C" : "Clubs",
    "D" : "Diamonds",
}

def main():
    for i in range(2, 10):
        for j in ["S", "H", "C", "D"]:
            os.rename(f"{i}{j}.svg", f"{i}_of_{trans[j]}.svg")

if __name__ == "__main__":
    main()
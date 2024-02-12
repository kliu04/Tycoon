'''
Rename downloaded card names from e.g., "9C.svg" to "9_of_Clubs.svg"
'''

import os

trans = {
    "S" : "Spades",
    "H" : "Hearts",
    "C" : "Clubs",
    "D" : "Diamonds",
}

trans_face = {
    "A" : "Ace",
    "T" : "10",
    "J" : "Jack",
    "Q" : "Queen",
    "K" : "King",
}

def main():
    for i in range(2, 10):
        for j in ["S", "H", "C", "D"]:
            try:
                os.rename(f"{i}{j}.svg", f"{i}_of_{trans[j]}.svg")
            except:
                continue

    for i in ["A", "T", "J", "Q", "K"]:
        for j in ["S", "H", "C", "D"]:
            try:
                os.rename(f"{i}{j}.svg", f"{trans_face[i]}_of_{trans[j]}.svg")
            except:
                continue        


if __name__ == "__main__":
    main()
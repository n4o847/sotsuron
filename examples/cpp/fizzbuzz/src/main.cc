#include <iostream>

int main(int argc, char **argv) {
  int n;
  std::cin >> n;

  for (int i = 1; i <= n; i++) {
    if (i % 15 == 0) {
      std::cout << "FizzBuzz" << std::endl;
    } else if (i % 3 == 0) {
      std::cout << "Fizz" << std::endl;
    } else if (i % 5 == 0) {
      std::cout << "Buzz" << std::endl;
    } else {
      std::cout << i << std::endl;
    }
  }

  return 0;
}

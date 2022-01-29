use std::io;

fn main() {
    println!("Please input a number.");

    let mut buf = String::new();

    io::stdin()
        .read_line(&mut buf)
        .expect("Failed to read line");

    let n: u32 = buf.trim().parse().expect("Please type a number!");

    println!("Your input: {}", n);

    for i in 1..=n {
        match (i % 3, i % 5) {
            (0, 0) => {
                println!("FizzBuzz");
            }
            (0, _) => {
                println!("Fizz");
            }
            (_, 0) => {
                println!("Buzz");
            }
            (_, _) => {
                println!("{}", i);
            }
        }
    }
}

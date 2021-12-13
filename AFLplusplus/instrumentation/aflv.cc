#define AFL_LLVM_PASS

#include <vector>

#include "llvm/IR/BasicBlock.h"
#include "llvm/IR/DebugInfoMetadata.h"
#include "llvm/Support/JSON.h"
#include "llvm/Support/raw_ostream.h"

#include "aflv.h"

using namespace llvm;

AFLVInstruction::AFLVInstruction(Instruction &Inst, DebugLoc &Loc) {
  auto *Scope = cast<DIScope>(Loc.getScope());

  Directory = Scope->getDirectory();
  Filename = Scope->getFilename();
  Line = Loc.getLine();
}

AFLVBasicBlock::AFLVBasicBlock(BasicBlock &BB, uint32_t id) : ID(id) {
  for (auto &Inst : BB) {
    if (auto Loc = Inst.getDebugLoc()) { Instructions.emplace_back(Inst, Loc); }
  }
}

void AFLVBuilder::print(raw_ostream &OS) {
  auto BBArray = json::Array();
  for (auto &BB : BasicBlocks) {
    auto InstArray = json::Array();
    for (auto &Inst : BB.Instructions) {
      auto InstObject = json::Object();
      InstObject["directory"] = Inst.Directory;
      InstObject["filename"] = Inst.Filename;
      InstObject["line"] = Inst.Line;
      InstArray.emplace_back(std::move(InstObject));
    }

    auto BBObject = json::Object();
    BBObject["id"] = BB.ID;
    BBObject["instructions"] = std::move(InstArray);
    BBArray.push_back(std::move(BBObject));
  }

  auto RootObject = json::Object();
  RootObject["basic_blocks"] = std::move(BBArray);

  auto Json = json::Value(std::move(RootObject));
  OS << formatv("{0:2}", Json) << '\n';
}

void AFLVBuilder::dump() {
  print(dbgs());
}

void AFLVBuilder::addBasicBlock(BasicBlock &BB, uint32_t id) {
  BasicBlocks.emplace_back(BB, id);
}

xs = {a: 3, b: 4, c: 5}.flat_map {|k, v| [k] * v }

N = 10000000

count = N.times.count do
  ys = xs.shuffle

  until ys.each_slice(3).all? {|zs| zs.uniq.count > 1 }
    ys = xs.shuffle
  end

  ys.first(3).include?(:a)
end

p count / N.to_f
# => 0.634807
